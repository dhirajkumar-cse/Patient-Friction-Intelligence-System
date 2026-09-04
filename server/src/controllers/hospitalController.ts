import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Hospital } from '../models/Hospital.js';
import { HospitalDepartment } from '../models/HospitalDepartment.js';
import { Patient } from '../models/Patient.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { GoogleMapsService } from '../services/googleMapsService.js';
import { TranslationService } from '../services/translationService.js';
import { AuditService } from '../services/auditService.js';

export class HospitalController {
  public static async getNearby(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string) || 23.3441;
      const lng = parseFloat(req.query.lng as string) || 85.3096;
      const radiusKm = parseFloat(req.query.radiusKm as string) || 50;
      const type = req.query.type as string;
      const emergencyOnly = req.query.emergency === 'true';
      const departmentFilter = req.query.department as string;
      const searchQuery = TranslationService.normalizeSearchQuery(
        (req.query.search as string || req.query.q as string || '').trim().toLowerCase()
      );

      const query: any = {};
      if (type && type !== 'All') {
        query.type = type;
      }
      if (emergencyOnly) {
        query.emergencyAvailable = true;
      }

      const allHospitals = await Hospital.find(query);

      // Compute distances, departments, doctor lists, and token seat capacity
      const hospitalsWithDetails = await Promise.all(
        allHospitals.map(async (hosp) => {
          const distResult = await GoogleMapsService.calculateDistance(
            lat,
            lng,
            hosp.latitude,
            hosp.longitude
          );

          let accessibilityFriction = 'LOW';
          if (distResult.distanceKm > 40) accessibilityFriction = 'HIGH';
          else if (distResult.distanceKm > 15) accessibilityFriction = 'MEDIUM';

          const depts = await HospitalDepartment.find({ hospitalId: hosp._id });

          // Calculate aggregated OPD token/seat availability
          const totalAvailableTokens = depts.reduce(
            (sum, d) => sum + (d.availableTokensToday || 0),
            0
          );
          const totalDailyTokens = depts.reduce(
            (sum, d) => sum + (d.dailyTokenCapacity || 0),
            0
          );

          const doctorsList = depts
            .filter((d) => d.headDoctorName)
            .map((d) => ({
              name: d.headDoctorName,
              department: d.name,
              opdTimings: d.opdTimings,
              availableTokens: d.availableTokensToday,
            }));

          return {
            ...hosp.toObject(),
            distanceKm: distResult.distanceKm,
            estimatedTravelTimeMinutes: distResult.durationMinutes,
            accessibilityFriction,
            departments: depts.map((d) => ({
              _id: d._id,
              name: d.name,
              headDoctorName: d.headDoctorName,
              availableTokensToday: d.availableTokensToday,
              dailyTokenCapacity: d.dailyTokenCapacity,
              opdTimings: d.opdTimings,
              consultationFee: d.consultationFee,
              isAcceptingRequests: d.isAcceptingRequests,
            })),
            doctorsList,
            totalAvailableTokens,
            totalDailyTokens,
          };
        })
      );

      // Filter by search query if present (across hospital name, city, doctor name, department, diagnosis)
      let list = hospitalsWithDetails;
      if (searchQuery) {
        list = list.filter((h) => {
          const nameMatch = h.name.toLowerCase().includes(searchQuery);
          const cityMatch = h.city.toLowerCase().includes(searchQuery);
          const addressMatch = (h.address || '').toLowerCase().includes(searchQuery);
          const diagMatch = (h.diagnosticFacilities || []).some((f: string) =>
            f.toLowerCase().includes(searchQuery)
          );
          const deptMatch = h.departments.some((d: any) =>
            d.name.toLowerCase().includes(searchQuery)
          );
          const docMatch = h.doctorsList.some((doc: any) =>
            doc.name?.toLowerCase().includes(searchQuery)
          );
          return nameMatch || cityMatch || addressMatch || diagMatch || deptMatch || docMatch;
        });
      }

      // Filter by department if specified
      if (departmentFilter && departmentFilter !== 'All') {
        list = list.filter((h) =>
          h.departments.some(
            (d: any) => d.name.toLowerCase() === departmentFilter.toLowerCase()
          )
        );
      }

      // Filter by radius
      let filtered = list.filter((h) => h.distanceKm <= radiusKm);
      let isAdaptiveProximity = false;

      // Smart Adaptive Fallback: If 0 hospitals within strict radius, return nearest across region
      if (filtered.length === 0 && list.length > 0) {
        filtered = list;
        isAdaptiveProximity = true;
      }

      // Sort by distance ascending
      filtered.sort((a, b) => a.distanceKm - b.distanceKm);

      res.status(200).json({
        success: true,
        count: filtered.length,
        userLocation: { latitude: lat, longitude: lng },
        radiusKm,
        isAdaptiveProximity,
        adaptiveMessage: isAdaptiveProximity
          ? `Showing nearest available health centers relative to your coordinates (${filtered.length} facilities).`
          : undefined,
        hospitals: filtered,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch nearby hospitals.' });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const hospital = await Hospital.findById(id);

      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital facility not found.' });
        return;
      }

      const departments = await HospitalDepartment.find({ hospitalId: hospital._id });

      let distanceKm = 0;
      let estimatedTravelTimeMinutes = 0;
      if (req.query.lat && req.query.lng) {
        const userLat = parseFloat(req.query.lat as string);
        const userLng = parseFloat(req.query.lng as string);
        const dist = await GoogleMapsService.calculateDistance(
          userLat,
          userLng,
          hospital.latitude,
          hospital.longitude
        );
        distanceKm = dist.distanceKm;
        estimatedTravelTimeMinutes = dist.durationMinutes;
      }

      res.status(200).json({
        success: true,
        hospital,
        departments,
        distanceKm,
        estimatedTravelTimeMinutes,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch hospital details.' });
    }
  }

  public static async search(req: Request, res: Response): Promise<void> {
    try {
      const queryStr = TranslationService.normalizeSearchQuery(
        (req.query.q as string || '').trim().toLowerCase()
      );
      if (!queryStr) {
        res.status(200).json({ success: true, hospitals: [] });
        return;
      }

      const hospitals = await Hospital.find({
        $or: [
          { name: { $regex: queryStr, $options: 'i' } },
          { city: { $regex: queryStr, $options: 'i' } },
          { state: { $regex: queryStr, $options: 'i' } },
          { address: { $regex: queryStr, $options: 'i' } },
          { diagnosticFacilities: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(20);

      const hospitalsWithDepts = await Promise.all(
        hospitals.map(async (h) => {
          const depts = await HospitalDepartment.find({ hospitalId: h._id });
          return {
            ...h.toObject(),
            departments: depts,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: hospitalsWithDepts.length,
        hospitals: hospitalsWithDepts,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Search failed.' });
    }
  }

  public static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const hospital = await Hospital.findOne({ userId: req.user?._id });
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital profile not found.' });
        return;
      }

      const departments = await HospitalDepartment.find({ hospitalId: hospital._id });

      res.status(200).json({
        success: true,
        hospital,
        departments,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch profile.' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const hospital = await Hospital.findOne({ userId: req.user?._id });
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital profile not found.' });
        return;
      }

      const {
        name,
        tagline,
        address,
        city,
        state,
        pincode,
        phone,
        emergencyPhone,
        workingHours,
        emergencyAvailable,
        totalBeds,
        availableBeds,
        specialistAvailable,
        diagnosticFacilities,
        languagesSupported,
      } = req.body;

      if (name) hospital.name = name;
      if (tagline !== undefined) hospital.tagline = tagline;
      if (address) hospital.address = address;
      if (city) hospital.city = city;
      if (state) hospital.state = state;
      if (pincode) hospital.pincode = pincode;
      if (phone) hospital.phone = phone;
      if (emergencyPhone !== undefined) hospital.emergencyPhone = emergencyPhone;
      if (workingHours) hospital.workingHours = workingHours;
      if (emergencyAvailable !== undefined) hospital.emergencyAvailable = emergencyAvailable;
      if (totalBeds !== undefined) hospital.totalBeds = totalBeds;
      if (availableBeds !== undefined) hospital.availableBeds = availableBeds;
      if (specialistAvailable !== undefined) hospital.specialistAvailable = specialistAvailable;
      if (diagnosticFacilities) hospital.diagnosticFacilities = diagnosticFacilities;
      if (languagesSupported) hospital.languagesSupported = languagesSupported;

      await hospital.save();

      await AuditService.log('HOSPITAL_PROFILE_UPDATED', 'Hospital', req, {
        userId: req.user?._id,
        resourceId: hospital._id.toString(),
      });

      res.status(200).json({
        success: true,
        message: 'Hospital details updated successfully.',
        hospital,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Update failed.' });
    }
  }

  public static async addDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const hospital = await Hospital.findOne({ userId: req.user?._id });
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital profile not found.' });
        return;
      }

      const {
        name,
        description,
        headDoctorName,
        opdDays,
        opdTimings,
        dailyTokenCapacity,
        availableTokensToday,
        consultationFee,
      } = req.body;

      if (!name) {
        res.status(400).json({ success: false, message: 'Department name is required.' });
        return;
      }

      const department = await HospitalDepartment.create({
        hospitalId: hospital._id,
        name,
        description: description || '',
        headDoctorName: headDoctorName || '',
        opdDays: Array.isArray(opdDays) ? opdDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opdTimings: opdTimings || '09:00 AM - 01:00 PM',
        dailyTokenCapacity: dailyTokenCapacity !== undefined ? dailyTokenCapacity : 50,
        availableTokensToday: availableTokensToday !== undefined ? availableTokensToday : 25,
        consultationFee: consultationFee !== undefined ? consultationFee : 0,
        isAcceptingRequests: true,
      });

      await AuditService.log('DEPARTMENT_CREATED', 'HospitalDepartment', req, {
        userId: req.user?._id,
        resourceId: department._id.toString(),
      });

      res.status(201).json({
        success: true,
        message: 'Department added successfully.',
        department,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to add department.' });
    }
  }

  public static async updateDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deptId } = req.params;
      const department = await HospitalDepartment.findById(deptId);

      if (!department) {
        res.status(404).json({ success: false, message: 'Department not found.' });
        return;
      }

      Object.assign(department, req.body);
      await department.save();

      res.status(200).json({
        success: true,
        message: 'Department updated successfully.',
        department,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update department.' });
    }
  }

  public static async deleteDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deptId } = req.params;
      const department = await HospitalDepartment.findByIdAndDelete(deptId);

      if (!department) {
        res.status(404).json({ success: false, message: 'Department not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Department deleted successfully.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to delete department.' });
    }
  }
}
