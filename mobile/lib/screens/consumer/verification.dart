import 'package:flutter/material.dart';

import '../../api/public_trace_api.dart';
import '../../core/api_exception.dart';
import '../../core/theme.dart';
import '../../models/public_trace.dart';
import '../../widgets/async_value_widget.dart';

class ConsumerVerificationScreen extends StatefulWidget {
  final String token;

  const ConsumerVerificationScreen({super.key, required this.token});

  @override
  State<ConsumerVerificationScreen> createState() => _ConsumerVerificationScreenState();
}

class _ConsumerVerificationScreenState extends State<ConsumerVerificationScreen> {
  PublicTrace? _trace;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final trace = await PublicTraceApi.getTrace(widget.token);
      if (!mounted) return;
      setState(() {
        _trace = trace;
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Unable to verify token.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1F2937),
        title: const Text('Food Safety Certificate'),
      ),
      body: AsyncValueWidget<PublicTrace>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: _trace,
        builder: (trace) => SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF1F2937),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: trace.verified ? const Color(0xFF10B981) : Colors.redAccent, 
                    width: 2,
                  ),
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: trace.verified ? const Color(0xFF10B981) : Colors.redAccent,
                      child: Icon(
                        trace.verified ? Icons.verified : Icons.warning_amber,
                        size: 44,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      trace.traceabilityStatus,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: trace.verified ? const Color(0xFF10B981) : Colors.redAccent,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Divider(color: Colors.grey),
                    const SizedBox(height: 16),
                    
                    if (trace.farm != null) ...[
                      _buildInfoRow('Farm Origin', trace.farm!.name),
                      _buildInfoRow('Location', trace.farm!.location),
                    ],
                    if (trace.livestock.isNotEmpty)
                      _buildInfoRow('Source Animals', trace.livestock.map((e) => e.tagNumber).join(', ')),
                    if (trace.milkSafety != null)
                      _buildInfoRow('Vet Clearance', trace.milkSafety!.status),
                    
                    _buildInfoRow('Token', widget.token),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}
