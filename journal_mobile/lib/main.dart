import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.init();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Journal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: FutureBuilder(
        future: ApiService.getSession(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }
          if (snapshot.hasData && snapshot.data != null) {
            final data = snapshot.data as Map<String, dynamic>;
            if (data['user'] != null) {
              return const HomeScreen();
            }
          }
          return const LoginScreen();
        },
      ),
    );
  }
}
