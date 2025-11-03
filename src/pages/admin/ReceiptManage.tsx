import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchReceipts, useCreateReceipt, useDeleteReceipt } from '@/hooks/useReceipt';
import { useEventsByYear } from '@/hooks/useEvent';
import { useChurches } from '@/hooks/useChurch';
import type { Receipt } from '@/services/api/receiptApi';
import type { IEvent } from '@/services/api/eventApi';
import type { Church } from '@/services/api/churchApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Trash2, Edit, ArrowLeft, Receipt as ReceiptIcon, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ReceiptManage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [churchSearch, setChurchSearch] = useState('');

  const { data: eventsData = { data: [] } } = useEventsByYear(selectedYear ? parseInt(selectedYear) : new Date().getFullYear());
  const events = Array.isArray(eventsData) ? eventsData : eventsData.data || [];
  const { data: receiptsDataResponse = { data: [] }, isLoading: receiptsLoading } = useSearchReceipts(
    selectedEvent ? { eventId: selectedEvent } : {}
  );
  const receiptsData = Array.isArray(receiptsDataResponse) ? receiptsDataResponse : receiptsDataResponse.data || [];
  const { data: churchesDataResponse = { data: [] } } = useChurches(
    churchSearch.length >= 2 
      ? /^\d{4}$/.test(churchSearch) 
        ? { mainId: churchSearch } 
        : { name: churchSearch }
      : {}
  );
  const churches = Array.isArray(churchesDataResponse) ? churchesDataResponse : churchesDataResponse.data || [];
  
  const createReceiptMutation = useCreateReceipt();
  const deleteReceiptMutation = useDeleteReceipt();
  
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
  }, []);

  useEffect(() => {
    const filtered = receiptsData.filter(receipt =>
      receipt.churchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.managerPhone.includes(searchTerm)
    );
    setFilteredReceipts(filtered);
  }, [searchTerm, receiptsData]);

  const handleChurchSelect = (church: Church) => {
    setFormData(prev => ({
      ...prev,
      churchId: { mainId: church.mainId, subId: church.subId },
      churchName: church.name,
    }));
    setChurchSearch('');
  };

  const handleCreateReceipt = async () => {
    if (!selectedEvent) {
      toast({
        variant: 'destructive',
        title: '이벤트를 선택해주세요',
      });
      return;
    }

    createReceiptMutation.mutate(
      {
        eventId: selectedEvent,
        ...formData,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        paymentDate: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setShowDialog(false);
          resetForm();
        }
      }
    );
  };

  const handleDeleteReceipt = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    deleteReceiptMutation.mutate(id);
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
              <Select value={selectedYear} onValueChange={setSelectedYear}>
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
        <>
          {receiptsLoading ? (
            <div className="flex justify-center items-center py-12 animate-fade-in">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReceipts.length === 0 && searchTerm === '' ? (
            <EmptyState
              icon={ReceiptIcon}
              title="영수증이 없습니다"
              description="선택한 이벤트에 대한 영수증을 추가하세요."
              action={{
                label: '영수증 추가',
                onClick: () => setShowDialog(true)
              }}
            />
          ) : (
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
                {filteredReceipts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    검색 결과가 없습니다
                  </div>
                ) : (
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
                        <TableRow key={receipt.id} className="hover:bg-muted/50 transition-colors">
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
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </>
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
                onChange={(e) => setChurchSearch(e.target.value)}
              />
              {churches.length > 0 && (
                <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                  {churches.map((church) => (
                    <div
                      key={`${church.mainId}-${church.subId}`}
                      className="p-2 hover:bg-accent cursor-pointer"
                      onClick={() => handleChurchSelect(church)}
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
            <Button onClick={handleCreateReceipt} disabled={!formData.churchName || createReceiptMutation.isPending}>
              {createReceiptMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptManage;
