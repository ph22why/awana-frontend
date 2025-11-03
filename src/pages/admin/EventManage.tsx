import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents, useDeleteEvent } from '@/hooks/useEvent';
import type { IEvent } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Loader2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/ui/empty-state';

const EventManage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: events = [], isLoading: loading } = useEvents();
  const deleteEventMutation = useDeleteEvent();
  
  const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event =>
        event.event_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_Location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, events]);

  const handleDelete = async () => {
    if (!selectedEventId) return;

    deleteEventMutation.mutate(selectedEventId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedEventId(null);
      }
    });
  };

  const openDeleteDialog = (eventId: string) => {
    setSelectedEventId(eventId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">이벤트 관리</h1>
          <p className="text-muted-foreground">이벤트를 생성하고 관리합니다.</p>
        </div>
        <Button onClick={() => navigate('/admin/events/create')}>
          <Plus className="mr-2 h-4 w-4" />
          새 이벤트 만들기
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="이벤트명 또는 장소로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 animate-fade-in">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="이벤트가 없습니다"
          description="새 이벤트를 생성하여 관리를 시작하세요."
          action={{
            label: '새 이벤트 만들기',
            onClick: () => navigate('/admin/events/create')
          }}
        />
      ) : (
        <div className="border rounded-lg animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이벤트명</TableHead>
                <TableHead>장소</TableHead>
                <TableHead>년도</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>종료일</TableHead>
                <TableHead>공개 여부</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event._id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{event.event_Name}</TableCell>
                  <TableCell>{event.event_Location}</TableCell>
                  <TableCell>{event.event_Year}</TableCell>
                  <TableCell>{new Date(event.event_Start_Date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(event.event_End_Date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.event_Open_Available}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(event._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이벤트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 이벤트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventManage;
