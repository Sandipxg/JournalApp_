import 'dart:convert';
import 'dart:io' show Platform;
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:url_launcher/url_launcher.dart';
import 'models/journal_entry.dart';

class ApiService {
  static final Dio _dio = Dio();
  static late PersistCookieJar _cookieJar;
  static bool _isInitialized = false;

  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3001';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:3001';
    } else {
      return 'http://localhost:3001';
    }
  }

  static Future<void> init() async {
    if (_isInitialized) return;

    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 5);
    _dio.options.receiveTimeout = const Duration(seconds: 3);
    _dio.options.contentType = 'application/json';
    
    // For Flutter Web, we need to enable sending cookies
    if (kIsWeb) {
      _dio.options.extra['withCredentials'] = true;
    }
    
    // Better-auth uses cookies for session management
    if (!kIsWeb) {
      final appDocDir = await getApplicationDocumentsDirectory();
      final String jarPath = '${appDocDir.path}/.cookies/';
      _cookieJar = PersistCookieJar(storage: FileStorage(jarPath));
      _dio.interceptors.add(CookieManager(_cookieJar));
    }

    _isInitialized = true;
  }

  // --- Auth Methods ---

  static Future<Map<String, dynamic>?> signUp(String email, String password, String name) async {
    await init();
    try {
      final response = await _dio.post('/api/auth/sign-up/email', data: {
        'email': email,
        'password': password,
        'name': name,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Future<Map<String, dynamic>?> login(String email, String password) async {
    await init();
    try {
      final response = await _dio.post('/api/auth/sign-in/email', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Future<void> loginWithGoogle() async {
    await init();
    final callbackUrl = kIsWeb ? Uri.base.origin : 'journalapp://callback';
    final url = Uri.parse('$baseUrl/api/auth/social-login/google?callbackURL=$callbackUrl');
    
    if (await canLaunchUrl(url)) {
      await launchUrl(url, webOnlyWindowName: '_self');
    } else {
      throw Exception('Could not launch Google login');
    }
  }

  static Future<bool> logout() async {
    await init();
    try {
      await _dio.post('/api/auth/sign-out', data: {});
      if (!kIsWeb) {
        await _cookieJar.deleteAll();
      }
      return true;
    } on DioException {
      return false;
    }
  }

  static Future<Map<String, dynamic>?> getSession() async {
    await init();
    try {
      final response = await _dio.get('/api/auth/get-session');
      return response.data;
    } on DioException {
      return null;
    }
  }

  // --- Journal Methods ---

  static Future<List<JournalEntry>> getEntries() async {
    await init();
    try {
      final response = await _dio.get('/rpc/getEntries');
      print('[DEBUG] getEntries response: ${response.data}');
      
      // ORPC returns data in a {"json": ...} wrapper
      dynamic data = response.data;
      if (data is Map && data.containsKey('json')) {
        data = data['json'];
      }

      if (data is List) {
        return data.map((json) => JournalEntry.fromJson(json)).toList();
      }
      return [];
    } on DioException catch (e) {
      print('[DEBUG] getEntries error: ${e.response?.data}');
      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized');
      }
      throw _handleError(e);
    }
  }

  static Future<JournalEntry> addEntry(String title, String content) async {
    await init();
    try {
      // ORPC standard post often expects wrapping, but let's see if plain works.
      // If it fails, we might need data: {'json': {'title': title, 'content': content}}
      final response = await _dio.post('/rpc/addEntry', data: {
        'json': {
          'title': title,
          'content': content,
        }
      });
      print('[DEBUG] addEntry response: ${response.data}');

      dynamic data = response.data;
      if (data is Map && data.containsKey('json')) {
        data = data['json'];
      }
      
      return JournalEntry.fromJson(data);
    } on DioException catch (e) {
      print('[DEBUG] addEntry error: ${e.response?.data}');
      throw _handleError(e);
    }
  }

  static Future<void> deleteEntry(int id) async {
    await init();
    try {
      await _dio.post('/rpc/deleteEntry', data: {
        'json': {'id': id}
      });
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Future<JournalEntry> updateEntry(int id, String title, String content) async {
    await init();
    try {
      final response = await _dio.post('/rpc/updateEntry', data: {
        'json': {
          'id': id,
          'title': title,
          'content': content,
        }
      });
      
      dynamic data = response.data;
      if (data is Map && data.containsKey('json')) {
        data = data['json'];
      }
      
      return JournalEntry.fromJson(data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  static Exception _handleError(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map && data.containsKey('message')) {
        return Exception(data['message']);
      }
      return Exception('Server error: ${e.response?.statusCode}');
    }
    return Exception('Connection Error: ${e.message}');
  }
}
