import 'package:flutter/material.dart';

import '../models/farm.dart';
import '../models/livestock.dart';
import '../models/user.dart';
import '../screens/admin/admin_dashboard.dart';
import '../screens/admin/create_user_screen.dart';
import '../screens/admin/edit_user_screen.dart';
import '../screens/admin/user_list_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/profile_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/consumer/verification.dart';
import '../screens/farmer/add_livestock_screen.dart';
import '../screens/farmer/create_farm_screen.dart';
import '../screens/farmer/create_milk_batch_screen.dart';
import '../screens/farmer/edit_farm_screen.dart';
import '../screens/farmer/edit_livestock_screen.dart';
import '../screens/farmer/farm_detail_screen.dart';
import '../screens/farmer/farmer_dashboard.dart';
import '../screens/farmer/livestock_detail_screen.dart';
import '../screens/farmer/milk_batch_detail_screen.dart';
import '../screens/farmer/milk_batch_list_screen.dart';
import '../screens/farmer/request_vet_visit_screen.dart';
import '../screens/farmer/treatments_screen.dart';
import '../screens/vet/record_treatment_screen.dart';
import '../screens/vet/vet_dashboard.dart';
import '../screens/vet/visit_detail_screen.dart';
import '../screens/vet/visit_list_screen.dart';

class AppRoutes {
  AppRoutes._();

  // Auth
  static const login = '/login';
  static const register = '/register';
  static const profile = '/profile';

  // Farmer
  static const farmerDashboard = '/farmer/dashboard';
  static const createFarm = '/farmer/farm/create';
  static const farmDetail = '/farmer/farm/detail';
  static const editFarm = '/farmer/farm/edit';
  static const addLivestock = '/farmer/livestock/add';
  static const livestockDetail = '/farmer/livestock/detail';
  static const editLivestock = '/farmer/livestock/edit';
  static const requestVetVisit = '/farmer/livestock/request-vet';
  static const milkBatches = '/farmer/milk-batches';
  static const createMilkBatch = '/farmer/milk-batches/create';
  static const milkBatchDetail = '/farmer/milk-batches/detail';
  static const treatments = '/farmer/treatments';
  static const farmerVisits = '/farmer/visits';

  // Vet
  static const vetDashboard = '/vet/dashboard';
  static const vetVisits = '/vet/visits';
  static const visitDetail = '/vet/visit/detail';
  static const recordTreatment = '/vet/record-treatment';

  // Admin
  static const adminDashboard = '/admin/dashboard';
  static const adminUsers = '/admin/users';
  static const createUser = '/admin/users/create';
  static const editUser = '/admin/users/edit';

  // Consumer
  static const consumerVerify = '/consumer/verify';

  /// Returns the dashboard route for the given user role.
  static String dashboardForRole(String role) {
    switch (role.toUpperCase()) {
      case 'VET':
        return vetDashboard;
      case 'ADMIN':
        return adminDashboard;
      default:
        return farmerDashboard;
    }
  }

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    final args = settings.arguments;

    switch (settings.name) {
      // ── Auth ──
      case login:
        return _page(const LoginScreen());
      case register:
        return _page(const RegisterScreen());
      case profile:
        return _page(ProfileScreen(user: args as User));

      // ── Farmer ──
      case farmerDashboard:
        return _page(FarmerDashboard(user: args as User));
      case createFarm:
        return _page(CreateFarmScreen(ownerId: args as int));
      case farmDetail:
        // args may be null (drawer navigation) — FarmDetailScreen resolves via getMine()
        return _page(FarmDetailScreen(farmId: args as int?));
      case editFarm:
        return _page(EditFarmScreen(farm: args as Farm));
      case addLivestock:
        return _page(AddLivestockScreen(farmId: args as int?));
      case livestockDetail:
        return _page(LivestockDetailScreen(livestockId: args as int));
      case editLivestock:
        return _page(EditLivestockScreen(livestock: args as Livestock));
      case requestVetVisit:
        return _page(RequestVetVisitScreen(livestockId: args as int));
      case milkBatches:
        // args may be int (direct farmId) or null (drawer navigation, screen resolves via getMine())
        return _page(MilkBatchListScreen(farmId: args as int?));
      case createMilkBatch:
        // args may be Map<String,dynamic> with farmId+livestock, or a bare int farmId from the FAB
        if (args is Map<String, dynamic>) {
          return _page(CreateMilkBatchScreen(
            farmId: args['farmId'] as int?,
            livestock: (args['livestock'] as List?)?.cast<Livestock>() ?? const [],
          ));
        }
        return _page(CreateMilkBatchScreen(farmId: args as int?));
      case milkBatchDetail:
        return _page(MilkBatchDetailScreen(milkBatchId: args as int));
      case treatments:
        return _page(const TreatmentsScreen());
      case farmerVisits:
        return _page(VisitListScreen(user: args as User));

      // ── Vet ──
      case vetDashboard:
        return _page(VetDashboard(user: args as User));
      case vetVisits:
        return _page(VisitListScreen(user: args as User));
      case visitDetail:
        return _page(VisitDetailScreen(visitId: args as int));
      case recordTreatment:
        final map = args as Map<String, dynamic>;
        return _page(RecordTreatmentScreen(
          livestockId: map['livestockId'] as int,
          vetVisitId: map['vetVisitId'] as int?,
        ));

      // ── Admin ──
      case adminDashboard:
        return _page(AdminDashboard(user: args as User));
      case adminUsers:
        return _page(const UserListScreen());
      case createUser:
        return _page(const CreateUserScreen());
      case editUser:
        return _page(EditUserScreen(user: args as User));

      // ── Consumer ──
      case consumerVerify:
        return _page(ConsumerVerificationScreen(token: args as String));

      default:
        return _page(const LoginScreen());
    }
  }

  static MaterialPageRoute<dynamic> _page(Widget child) {
    return MaterialPageRoute(builder: (_) => child);
  }
}
