import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Hospital } from '../models/Hospital.js';
import { generateToken } from '../utils/jwt.js';
import { AuditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, phone, ...extraDetails } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const userRole = role === 'hospital' || role === 'admin' ? role : 'patient';

      const newUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: userRole,
        phone,
      });

      let profileData: any = null;

      if (userRole === 'patient') {
        const count = await Patient.countDocuments();
        const patientCode = `PAT-${1000 + count + 1}`;

        const newPatient = await Patient.create({
          userId: newUser._id,
          patientCode,
          age: extraDetails.age || 42,
          gender: extraDetails.gender || 'female',
          preferredLanguage: extraDetails.preferredLanguage || 'Hindi',
          phone: phone || extraDetails.phone,
          transportAvailability: extraDetails.transportAvailability || 'low',
          digitalAccessLevel: extraDetails.digitalAccessLevel || 'basic',
          familySupport: extraDetails.familySupport || 'low',
          documentationStatus: extraDetails.documentationStatus || 'partial',
          financialAccessibility: extraDetails.financialAccessibility || 'severely_constrained',
          appointmentFlexibility: extraDetails.appointmentFlexibility || 'inflexible_daily_wage',
          residenceType: extraDetails.residenceType || 'rural_remote',
          location: {
            address: extraDetails.address || 'Village Ramgarh, Block B',
            city: extraDetails.city || 'Ranchi',
            state: extraDetails.state || 'Jharkhand',
            pincode: extraDetails.pincode || '834001',
            latitude: extraDetails.latitude || 23.3441,
            longitude: extraDetails.longitude || 85.3096,
            geoJSON: {
              type: 'Point',
              coordinates: [extraDetails.longitude || 85.3096, extraDetails.latitude || 23.3441],
            },
          },
        });

        // Initialize Friction & Risk
        const frictionCalc = FrictionEngine.calculate(newPatient.toObject(), null, 35);
        const frictionProfile = await FrictionProfile.create({
          patientId: newPatient._id,
          ...frictionCalc,
        });

        const riskCalc = RiskEngine.evaluate(frictionCalc);
        const careRisk = await CareRisk.create({
          patientId: newPatient._id,
          frictionProfileId: frictionProfile._id,
          ...riskCalc,
        });

        newPatient.activeFrictionProfileId = frictionProfile._id as any;
        newPatient.activeCareRiskId = careRisk._id as any;
        await newPatient.save();

        profileData = newPatient;
      } else if (userRole === 'hospital') {
        const newHospital = await Hospital.create({
          userId: newUser._id,
          name: extraDetails.hospitalName || name,
          type: extraDetails.type || 'Government',
          address: extraDetails.address || 'Civil Lines Medical Enclave',
          city: extraDetails.city || 'Ranchi',
          state: extraDetails.state || 'Jharkhand',
          pincode: extraDetails.pincode || '834001',
          latitude: extraDetails.latitude || 23.3629,
          longitude: extraDetails.longitude || 85.3262,
          geoJSON: {
            type: 'Point',
            coordinates: [extraDetails.longitude || 85.3262, extraDetails.latitude || 23.3629],
          },
          phone: phone || '0651-2441234',
          email: email.toLowerCase().trim(),
          emergencyAvailable: true,
          totalBeds: extraDetails.totalBeds || 300,
          availableBeds: extraDetails.availableBeds || 45,
          specialistAvailable: true,
        });
        profileData = newHospital;
      }

      const token = generateToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      await AuditService.log('AUTH_REGISTER', 'User', req, {
        userId: newUser._id,
        actorRole: newUser.role,
        details: { email: newUser.email, role: newUser.role },
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
        },
        profile: profileData,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email address or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email address or password.' });
        return;
      }

      let profile: any = null;
      if (user.role === 'patient') {
        profile = await Patient.findOne({ userId: user._id })
          .populate('activeFrictionProfileId')
          .populate('activeCareRiskId');
      } else if (user.role === 'hospital') {
        profile = await Hospital.findOne({ userId: user._id });
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      await AuditService.log('AUTH_LOGIN', 'User', req, {
        userId: user._id,
        actorRole: user.role,
        details: { email: user.email },
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        profile,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Login failed.' });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      let profile: any = null;
      if (user.role === 'patient') {
        profile = await Patient.findOne({ userId: user._id })
          .populate('activeFrictionProfileId')
          .populate('activeCareRiskId');
      } else if (user.role === 'hospital') {
        profile = await Hospital.findOne({ userId: user._id });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        profile,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch session.' });
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user) {
      await AuditService.log('AUTH_LOGOUT', 'User', req, {
        userId: req.user._id,
        actorRole: req.user.role,
      });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }
}
