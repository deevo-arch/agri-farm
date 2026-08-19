import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('App loads cleanly test', (WidgetTester tester) async {
    await tester.pumpWidget(const AgriTrustMobileApp());
    expect(find.text('AgriTrust'), findsOneWidget);
  });
}
