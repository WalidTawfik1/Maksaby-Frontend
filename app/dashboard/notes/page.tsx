'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, StickyNote, Search, Edit, Trash2, Check, X as XIcon, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NoteFormDialog } from '@/components/note-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { getAllNotes, deleteNote, toggleNoteCompletion } from '@/lib/api-client'
import { formatDateTime } from '@/lib/utils'
import { Note } from '@/types'
import toast from 'react-hot-toast'
import { translateApiMessage } from '@/lib/translations'

export default function NotesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const queryClient = useQueryClient()

  const { data: notesResponse, isLoading } = useQuery({
    queryKey: ['notes', searchQuery, filterCompleted],
    queryFn: async () => {
      return await getAllNotes({
        pageNum: 1,
        pageSize: 50,
        searchTerm: searchQuery || null,
        isCompleted: filterCompleted,
      })
    },
  })

  const notes = notesResponse?.data || []

  // Toggle completion mutation
  const toggleMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return await toggleNoteCompletion(noteId)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success(translateApiMessage(response.message))
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'فشل تغيير حالة الملاحظة'
      toast.error(errorMessage)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteNote(id)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success(translateApiMessage(response.message))
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'فشل حذف الملاحظة'
      toast.error(errorMessage)
    },
  })

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddNote = () => {
    setSelectedNote(null)
    setIsFormOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setIsFormOpen(true)
  }

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      deleteMutation.mutate(noteToDelete.id)
      setIsDeleteDialogOpen(false)
      setNoteToDelete(null)
    }
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setNoteToDelete(null)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedNote(null)
  }

  const handleToggleComplete = (noteId: string) => {
    toggleMutation.mutate(noteId)
  }

  const pendingNotes = notes.filter(n => !n.isCompleted)
  const completedNotes = notes.filter(n => n.isCompleted)

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الملاحظات</h1>
          <p className="text-muted-foreground">إدارة الملاحظات والمهام</p>
        </div>
        <Button onClick={handleAddNote}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة ملاحظة
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث في الملاحظات... (اضغط Enter للبحث)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterCompleted === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCompleted(null)}
          >
            الكل
          </Button>
          <Button
            variant={filterCompleted === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCompleted(false)}
          >
            قيد الانتظار
          </Button>
          <Button
            variant={filterCompleted === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCompleted(true)}
          >
            مكتملة
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <StickyNote className="h-5 w-5" />
              ملاحظات قيد الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {pendingNotes.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <Check className="h-5 w-5" />
              ملاحظات مكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {completedNotes.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <StickyNote className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد ملاحظات</p>
            </CardContent>
          </Card>
        ) : (
          notes?.map((note) => (
            <Card 
              key={note.id} 
              className={`hover:shadow-lg transition-shadow ${
                note.isCompleted ? 'opacity-75' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(note.id)}
                    disabled={toggleMutation.isPending}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      note.isCompleted
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300 hover:border-green-600'
                    }`}
                  >
                    {note.isCompleted && <Check className="h-4 w-4 text-white" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-base whitespace-pre-wrap ${
                      note.isCompleted ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {note.content}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      {note.customerName && (
                        <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          <User className="h-3 w-3" />
                          {note.customerName}
                        </span>
                      )}
                      <span>{formatDateTime(note.createdAt)}</span>
                      {note.isCompleted && note.completedAt && (
                        <span className="text-green-600">
                          ✓ {formatDateTime(note.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNote(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Note Form Dialog */}
      <NoteFormDialog
        note={selectedNote}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="حذف الملاحظة"
        message={`هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
