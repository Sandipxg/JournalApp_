import 'package:flutter/material.dart';
import '../api_service.dart';
import '../models/journal_entry.dart';
import 'entry_editor_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<JournalEntry>> _entriesFuture;

  @override
  void initState() {
    super.initState();
    _refreshEntries();
  }

  void _refreshEntries() {
    setState(() {
      _entriesFuture = ApiService.getEntries().catchError((e) {
        if (e.toString().contains('Unauthorized') && mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const LoginScreen()),
            (route) => false,
          );
        }
        throw e;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Journal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshEntries,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ApiService.logout();
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
      body: FutureBuilder<List<JournalEntry>>(
        future: _entriesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            if (snapshot.error.toString().contains('Unauthorized')) {
              return const SizedBox.shrink(); // Navigator will handle it
            }
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 60),
                  const SizedBox(height: 16),
                  Text('Error: ${snapshot.error}', textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _refreshEntries,
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            );
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No entries found. Start writing!'));
          }

          final entries = snapshot.data!;
          return ListView.builder(
            itemCount: entries.length,
            itemBuilder: (context, index) {
              final entry = entries[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text(entry.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(
                    entry.content,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  onTap: () async {
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => EntryEditorScreen(entry: entry)),
                    );
                    if (result == true) {
                      _refreshEntries();
                    }
                  },
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.grey),
                    onPressed: () async {
                      try {
                        await ApiService.deleteEntry(entry.id);
                        _refreshEntries();
                      } catch (e) {
                         if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Failed to delete: $e')),
                          );
                        }
                      }
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const EntryEditorScreen()),
          );
          if (result == true) {
            _refreshEntries();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
