import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { churchApi } from '@/services/api/churchApi';
import type { Church } from '@/types/church';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChurchManage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [churches, setChurches] = useState<Church[]>([]);
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    mainId: '',
    subId: '',
  });

  const fetchChurches = async () => {
    setLoading(true);
    try {
      const response = await churchApi.searchChurches({ getAllResults: true });
      setChurches(response.data);
      setFilteredChurches(response.data);
    } catch (error) {
      console.error('Failed to fetch churches:', error);
      toast({
        variant: 'destructive',
        title: '교회 목록 불러오기 실패',
        description: '교회 목록을 불러오는데 실패했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurches();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredChurches(churches);
    } else {
      const filtered = churches.filter(church =>
        church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.mainId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredChurches(filtered);
    }
  }, [searchTerm, churches]);

  const handleDelete = async () => {
    if (!selectedChurch) return;

    try {
      await churchApi.deleteChurch(selectedChurch.id);
      toast({
        title: '교회 삭제 완료',
        description: '교회가 성공적으로 삭제되었습니다.',
      });
      fetchChurches();
    } catch (error) {
      console.error('Failed to delete church:', error);
      toast({
        variant: 'destructive',
        title: '교회 삭제 실패',
        description: '교회 삭제에 실패했습니다.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedChurch(null);
    }
  };

  const openDeleteDialog = (church: Church) => {
    setSelectedChurch(church);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (church: Church) => {
    setSelectedChurch(church);
    setFormData({
      name: church.name,
      location: church.location,
      mainId: church.mainId,
      subId: church.subId,
    });
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedChurch) return;

    try {
      await churchApi.updateChurch(selectedChurch.id, formData);
      toast({
        title: '교회 수정 완료',
        description: '교회 정보가 성공적으로 수정되었습니다.',
      });
      fetchChurches();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update church:', error);
      toast({
        variant: 'destructive',
        title: '교회 수정 실패',
        description: '교회 정보 수정에 실패했습니다.',
      });
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">교회 관리</h1>
          <p className="text-muted-foreground">교회를 등록하고 관리합니다.</p>
        </div>
        <Button onClick={() => navigate('/admin/churches/create')}>
          <Plus className="mr-2 h-4 w-4" />
          새 교회 등록
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="교회명 또는 등록번호로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>교회명</TableHead>
                <TableHead>교회 ID</TableHead>
                <TableHead>주소</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChurches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    교회가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredChurches.map((church) => (
                  <TableRow key={church._id || church.id}>
                    <TableCell className="font-medium">{church.name}</TableCell>
                    <TableCell>{church.mainId}-{church.subId}</TableCell>
                    <TableCell>{church.location}</TableCell>
                    <TableCell>{church.phone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(church)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(church)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>교회 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 교회를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>교회 정보 수정</DialogTitle>
            <DialogDescription>
              교회 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">교회명</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">주소</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mainId">Main ID</Label>
                <Input
                  id="mainId"
                  value={formData.mainId}
                  onChange={(e) => setFormData({ ...formData, mainId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subId">Sub ID</Label>
                <Input
                  id="subId"
                  value={formData.subId}
                  onChange={(e) => setFormData({ ...formData, subId: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEdit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChurchManage;
