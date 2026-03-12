class JournalEntry {
  final int id;
  final String title;
  final String content;
  final String? userId;

  JournalEntry({
    required this.id,
    required this.title,
    required this.content,
    this.userId,
  });

  factory JournalEntry.fromJson(Map<String, dynamic> json) {
    return JournalEntry(
      id: json['id'] as int,
      title: json['title'] as String,
      content: json['content'] as String,
      userId: json['userId'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'userId': userId,
    };
  }
}
