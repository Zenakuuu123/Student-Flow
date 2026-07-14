'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { noteService } from '@/services/note.service';
import { courseService } from '@/services/course.service';
import type { Note, Course } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Bold,
  Italic,
  Heading1,
  List,
  Code2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [n, c] = await Promise.all([noteService.getAll(), courseService.getAll()]);
      setNotes(n);
      setCourses(c);
      if (n.length > 0 && !selectedNote) {
        setSelectedNote(n[0]);
      }
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [selectedNote]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (editorRef.current && selectedNote) {
      editorRef.current.innerHTML = selectedNote.content || '';
    }
  }, [selectedNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredNotes = notes.filter((n) => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCourse !== 'all' && n.course_id !== filterCourse) return false;
    return true;
  });

  const createNote = async () => {
    try {
      const note = await noteService.create({ title: 'Untitled Note' });
      setNotes((prev) => [note, ...prev]);
      setSelectedNote(note);
      toast.success('Note created');
    } catch {
      toast.error('Failed to create note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await noteService.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(notes.find((n) => n.id !== id) || null);
      }
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const updateTitle = async (title: string) => {
    if (!selectedNote) return;
    setSelectedNote({ ...selectedNote, title });
    setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? { ...n, title } : n)));

    // Debounced save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await noteService.update(selectedNote.id, { title });
      } catch {
        console.error('Failed to save title');
      }
    }, 500);
  };

  const handleEditorInput = () => {
    if (!selectedNote || !editorRef.current) return;
    const content = editorRef.current.innerHTML;

    // Debounced auto-save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await noteService.update(selectedNote.id, { content });
        setNotes((prev) =>
          prev.map((n) => (n.id === selectedNote.id ? { ...n, content, updated_at: new Date().toISOString() } : n))
        );
      } catch {
        console.error('Failed to auto-save');
      }
    }, 500);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex gap-4 h-[calc(100vh-10rem)] animate-pulse">
        <div className="w-72 rounded-xl bg-muted/50" />
        <div className="flex-1 rounded-xl bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Notes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-14rem)]">
        {/* Notes List Sidebar */}
        <Card className="w-72 shrink-0 bg-card/50 border-border/50 flex flex-col">
          <div className="p-3 space-y-2 border-b border-border/50">
            <Button onClick={createNote} className="w-full gap-2" size="sm">
              <Plus className="w-4 h-4" />
              New Note
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-background/50"
              />
            </div>
            <Select value={filterCourse} onValueChange={(v) => setFilterCourse(v || 'all')}>
              <SelectTrigger className="h-8 text-xs bg-background/50">
                {filterCourse && filterCourse !== 'all' ? (
                  (() => {
                    const course = courses.find((c) => c.id === filterCourse);
                    return course ? `${course.icon} ${course.name}` : 'All Courses';
                  })()
                ) : (
                  <SelectValue placeholder="All Courses" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No notes found</p>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  role="button"
                  tabIndex={0}
                  className={`relative w-full text-left p-2.5 rounded-lg transition-colors group cursor-pointer ${
                    selectedNote?.id === note.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-accent border border-transparent'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedNote(note);
                    }
                  }}
                >
                  <p className="text-sm font-medium truncate">{note.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(note.updated_at)}
                    </span>
                  </div>
                  {/* Delete on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))
            )}

          </div>
        </Card>

        {/* Editor Pane */}
        <Card className="flex-1 bg-card/50 border-border/50 flex flex-col">
          {selectedNote ? (
            <>
              {/* Title */}
              <div className="p-4 pb-0">
                <Input
                  value={selectedNote.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  className="border-0 text-xl font-bold p-0 h-auto focus-visible:ring-0 bg-transparent"
                  placeholder="Note title..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Last edited {formatDate(selectedNote.updated_at)}
                </p>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')}>
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')}>
                  <Italic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('formatBlock', 'h2')}>
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertUnorderedList')}>
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('formatBlock', 'pre')}>
                  <Code2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-y-auto">
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  className="p-4 min-h-full outline-none text-sm leading-relaxed prose prose-invert max-w-none [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-4 [&>h2]:mb-2 [&>pre]:bg-muted/50 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:text-xs [&>pre]:font-mono [&>ul]:list-disc [&>ul]:pl-5"
                  suppressContentEditableWarning
                />
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-medium">No note selected</p>
              <p className="text-sm mt-1">Select a note or create a new one</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
