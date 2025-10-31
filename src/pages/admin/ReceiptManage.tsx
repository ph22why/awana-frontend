import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { receiptApi, Receipt } from '@/services/api/receiptApi';
import { eventApi, IEvent, IEventGroup } from '@/services/api/eventApi';
import { churchApi, Church } from '@/services/api/churchApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ReceiptManage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [events, setEvents] = useState<IEvent[]>([]);
  const [groups, setGroups] = useState<IEventGroup[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [churchSearch, setChurchSearch] = useState('');
  
  const [formData, setFormData] = useState({
    churchId: { mainId: '', subId: '' },
    churchName: '',
    managerName: '',
    managerPhone: '',
    partTotal: 0,
    partStudent: 0,
    partTeacher: 0,
    partYM: 0,
    costs: 0,
  });

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setSelectedYear(currentYear.toString());
    fetchEvents(currentYear.toString());
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchReceipts(selectedEvent);
    }
  }, [selectedEvent]);

  useEffect(() => {
    const filtered = receipts.filter(receipt =>
      receipt.churchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.managerPhone.includes(searchTerm)
    );
    setFilteredReceipts(filtered);
  }, [searchTerm, receipts]);

  const fetchEvents = async (year: string) => {
    try {
      setLoading(true);
      const response = await eventApi.getEventsByYear(parseInt(year));
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '이벤트 로딩 실패',
        description: '이벤트 목록을 불러오는데 실패했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReceipts = async (eventId: string) => {
    try {
      setLoading(true);
      const response = await receiptApi.searchReceipts({ eventId });
      if (response.success) {
        setReceipts(response.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '영수증 로딩 실패',
        description: '영수증 목록을 불러오는데 실패했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChurchSearch = async (value: string) => {
    if (!value || value.length < 2) {
      setChurches([]);
      return;
    }

    try {
      const isMainId = /^\d{4}$/.test(value);
      const response = await churchApi.searchChurches(
        isMainId ? { mainId: value } : { name: value }
      );
      
      if (response.success) {
        setChurches(response.data);
      }
    } catch (error) {
      console.error('Church search error:', error);
    }
  };

  const handleChurchSelect = (church: Church) => {
    setFormData(prev => ({
      ...prev,
      churchId: { mainId: church.mainId, subId: church.subId },
      churchName: church.name,
    }));
    setChurches([]);
  };

  const handleCreateReceipt = async () => {
    if (!selectedEvent) {
      toast({
        variant: 'destructive',
        title: '이벤트를 선택해주세요',
      });
      return;
    }

    try {
      setLoading(true);
      await receiptApi.createReceipt({
        eventId: selectedEvent,
        ...formData,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        paymentDate: new Date().toISOString(),
      });

      toast({
        title: '영수증 생성 완료',
        description: '영수증이 성공적으로 생성되었습니다.',
      });

      setShowDialog(false);
      fetchReceipts(selectedEvent);
      resetForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '영수증 생성 실패',
        description: '영수증 생성 중 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await receiptApi.deleteReceipt(id);
      toast({
        title: '삭제 완료',
        description: '영수증이 삭제되었습니다.',
      });
      fetchReceipts(selectedEvent);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '삭제 실패',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      churchId: { mainId: '', subId: '' },
      churchName: '',
      managerName: '',
      managerPhone: '',
      partTotal: 0,
      partStudent: 0,
      partTeacher: 0,
      partYM: 0,
      costs: 0,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">영수증 관리</h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>이벤트 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>연도</Label>
              <Select value={selectedYear} onValueChange={(value) => {
                setSelectedYear(value);
                fetchEvents(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="연도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>이벤트</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="이벤트 선택" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event._id} value={event._id}>{event.event_Name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>영수증 목록</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="교회명, 담당자, 전화번호 검색..."
                    className="pl-10 w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  영수증 추가
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>교회명</TableHead>
                  <TableHead>교회코드</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>총인원</TableHead>
                  <TableHead>비용</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.churchName}</TableCell>
                    <TableCell>{receipt.churchId.mainId}-{receipt.churchId.subId}</TableCell>
                    <TableCell>{receipt.managerName}</TableCell>
                    <TableCell>{receipt.managerPhone}</TableCell>
                    <TableCell>{receipt.partTotal}</TableCell>
                    <TableCell>{receipt.costs.toLocaleString()}원</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReceipt(receipt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReceipts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      영수증이 없습니다
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>영수증 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>교회 검색</Label>
              <Input
                placeholder="교회명 또는 교회코드 입력"
                value={churchSearch}
                onChange={(e) => {
                  setChurchSearch(e.target.value);
                  handleChurchSearch(e.target.value);
                }}
              />
              {churches.length > 0 && (
                <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                  {churches.map((church) => (
                    <div
                      key={`${church.mainId}-${church.subId}`}
                      className="p-2 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        handleChurchSelect(church);
                        setChurchSearch('');
                      }}
                    >
                      {church.name} ({church.mainId}-{church.subId})
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {formData.churchName && (
              <>
                <div>
                  <Label>선택된 교회</Label>
                  <Input value={`${formData.churchName} (${formData.churchId.mainId}-${formData.churchId.subId})`} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>담당자 이름</Label>
                    <Input
                      value={formData.managerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>연락처</Label>
                    <Input
                      value={formData.managerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, managerPhone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>학생</Label>
                    <Input
                      type="number"
                      value={formData.partStudent}
                      onChange={(e) => setFormData(prev => ({ ...prev, partStudent: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>교사</Label>
                    <Input
                      type="number"
                      value={formData.partTeacher}
                      onChange={(e) => setFormData(prev => ({ ...prev, partTeacher: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>청년부</Label>
                    <Input
                      type="number"
                      value={formData.partYM}
                      onChange={(e) => setFormData(prev => ({ ...prev, partYM: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>총 인원</Label>
                    <Input
                      type="number"
                      value={formData.partTotal}
                      onChange={(e) => setFormData(prev => ({ ...prev, partTotal: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>비용</Label>
                  <Input
                    type="number"
                    value={formData.costs}
                    onChange={(e) => setFormData(prev => ({ ...prev, costs: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>취소</Button>
            <Button onClick={handleCreateReceipt} disabled={!formData.churchName || loading}>
              {loading ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptManage;
