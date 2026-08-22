import 'package:flutter/material.dart';
import '../../api/auth_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../widgets/custom_button.dart';
import '../consumer/verification.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'farmer@agritrust.com');
  final _passwordController = TextEditingController(text: 'password');
  final _qrTokenController = TextEditingController(text: 'AGRI-TRACE-DEMO-TOKEN-8888');
  bool _isLoading = false;
  String _errorMessage = '';

  void _fillDemo(String email) {
    setState(() {
      _emailController.text = email;
      _passwordController.text = 'password';
      _errorMessage = '';
    });
  }

  void _handleLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final session = await AuthApi.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      final user = session.toUser();

      if (!mounted) return;

      final route = AppRoutes.dashboardForRole(user.role);
      Navigator.pushNamedAndRemoveUntil(
        context,
        route,
        (_) => false,
        arguments: user,
      );
    } on ApiException catch (e) {
      setState(() {
        _errorMessage = e.message;
      });
    } catch (_) {
      setState(() {
        _errorMessage = 'Invalid email or password';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleConsumerVerify() {
    final token = _qrTokenController.text.trim();
    if (token.isEmpty) return;
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ConsumerVerificationScreen(token: token)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0C1914),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(left: 20, right: 20, top: 40, bottom: 20),
          child: Column(
            children: [
              // Logo & Title
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF10B981)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF10B981).withAlpha(100),
                      blurRadius: 20,
                      spreadRadius: 2,
                    )
                  ],
                ),
                child: const Icon(Icons.eco, size: 48, color: Colors.white),
              ),
              const SizedBox(height: 14),
              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF34D399), Color(0xFFF59E0B)],
                ).createShader(bounds),
                child: const Text(
                  'AgriTrust Mobile',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const Text(
                'Livestock Traceability & Food Safety',
                style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
              ),
              const SizedBox(height: 28),

              // Demo Account Selector Pills
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildRolePill('🌾 Farmer', 'farmer@agritrust.com'),
                  const SizedBox(width: 8),
                  _buildRolePill('🩺 Vet', 'vet@agritrust.com'),
                  const SizedBox(width: 8),
                  _buildRolePill('👑 Admin', 'admin@agritrust.com'),
                ],
              ),
              const SizedBox(height: 20),

              // Glassmorphism Login Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF152A22),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF1F3F33)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(80),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    )
                  ],
                ),
                child: Column(
                  children: [
                    if (_errorMessage.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.red.withAlpha(50),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.redAccent),
                        ),
                        child: Text(
                          _errorMessage,
                          style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],

                    TextField(
                      controller: _emailController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        labelText: 'Email Address',
                        labelStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                        prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF10B981)),
                        filled: true,
                        fillColor: const Color(0xFF0C1914),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFF1F3F33)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFF10B981), width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: _passwordController,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        labelText: 'Password',
                        labelStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                        prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF10B981)),
                        filled: true,
                        fillColor: const Color(0xFF0C1914),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFF1F3F33)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFF10B981), width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    CustomButton(
                      text: 'Sign In to Dashboard',
                      isLoading: _isLoading,
                      onPressed: _handleLogin,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Consumer QR Verification Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF152A22).withAlpha(150),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF10B981).withAlpha(80)),
                ),
                child: Column(
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.qr_code_scanner, color: Color(0xFFF59E0B), size: 20),
                        SizedBox(width: 6),
                        Text(
                          'Consumer Verification',
                          style: TextStyle(
                            color: Color(0xFFF59E0B),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Verify milk safety & vet history instantly',
                      style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 12),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _qrTokenController,
                            style: const TextStyle(color: Colors.white, fontSize: 12),
                            decoration: InputDecoration(
                              hintText: 'Enter QR Token...',
                              hintStyle: const TextStyle(color: Colors.grey),
                              filled: true,
                              fillColor: const Color(0xFF0C1914),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(color: Color(0xFF1F3F33)),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF59E0B),
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                          onPressed: _handleConsumerVerify,
                          child: const Text('Verify 🥛', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRolePill(String label, String email) {
    final isSelected = _emailController.text == email;
    return GestureDetector(
      onTap: () => _fillDemo(email),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF10B981) : const Color(0xFF152A22),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF34D399) : const Color(0xFF1F3F33),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}
