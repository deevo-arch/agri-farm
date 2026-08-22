import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../api/milk_batch_api.dart';
import '../../core/api_exception.dart';
import '../../core/app_routes.dart';
import '../../core/auth_storage.dart';
import '../../core/dates.dart';
import '../../core/theme.dart';
import '../../models/milk_batch.dart';
import '../../widgets/async_value_widget.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/form_message.dart';
import '../../widgets/role_scaffold.dart';

class MilkBatchDetailScreen extends StatefulWidget {
  const MilkBatchDetailScreen({super.key, required this.milkBatchId});

  final int milkBatchId;

  @override
  State<MilkBatchDetailScreen> createState() => _MilkBatchDetailScreenState();
}

class _MilkBatchDetailScreenState extends State<MilkBatchDetailScreen> {
  MilkBatch? _batch;
  QrCodeResult? _qr;
  bool _loading = true;
  bool _qrLoading = false;
  String? _error;
  String _qrError = '';

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
      final batch = await MilkBatchApi.getById(widget.milkBatchId);
      if (!mounted) return;
      setState(() {
        _batch = batch;
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  Future<void> _generateQr() async {
    setState(() {
      _qrLoading = true;
      _qrError = '';
    });
    try {
      final qr = await MilkBatchApi.generateQr(widget.milkBatchId);
      if (!mounted) return;
      setState(() => _qr = qr);
    } on ApiException catch (e) {
      setState(() => _qrError = e.message);
    } finally {
      if (mounted) setState(() => _qrLoading = false);
    }
  }

  Uint8List? _qrBytes() {
    final image = _qr?.qrImage;
    if (image == null || image.isEmpty) return null;
    final comma = image.indexOf(',');
    final payload = comma >= 0 ? image.substring(comma + 1) : image;
    try {
      return base64Decode(payload);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return RoleScaffold(
      user: AuthStorage.instance.session!.toUser(),
      title: _batch?.batchCode ?? 'Milk batch',
      body: AsyncValueWidget<MilkBatch>(
        isLoading: _loading,
        error: _error,
        onRetry: _load,
        data: _batch,
        builder: (batch) {
          final bytes = _qrBytes();
          return ListView(
            padding: AppSpacing.page,
            children: [
              Text(batch.farmName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 8),
              Text('Collected ${formatDate(batch.collectionDate)}', style: const TextStyle(color: AppColors.muted)),
              Text('${batch.quantityLitres} litres', style: const TextStyle(color: AppColors.muted)),
              Text('Animals: ${batch.livestockIds.length}', style: const TextStyle(color: AppColors.muted)),
              const SizedBox(height: 20),
              FormMessage.error(_qrError),
              CustomButton(text: 'Generate / view QR', isLoading: _qrLoading, onPressed: _generateQr),
              if (_qr != null) ...[
                const SizedBox(height: 16),
                if (bytes != null)
                  Center(child: Image.memory(bytes, width: 220, height: 220))
                else
                  SelectableText(_qr!.traceUrl, style: const TextStyle(color: AppColors.primary)),
                const SizedBox(height: 8),
                SelectableText('Token: ${_qr!.token}', style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                TextButton(
                  onPressed: () => Navigator.pushNamed(
                    context,
                    AppRoutes.consumerVerify,
                    arguments: _qr!.token,
                  ),
                  child: const Text('Open public trace'),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}
