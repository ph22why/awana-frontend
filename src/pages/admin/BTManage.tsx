import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChurchManagers, useUpdateChurchManagerStatus, useBTReceiptByManager } from '@/hooks/useBT';
import type { ChurchManager } from '@/services/api/btApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Receipt, RefreshCw, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const BTManage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: churchManagersData = { data: [] }, isLoading: loading } = useChurchManagers();
  const churchManagers = Array.isArray(churchManagersData) ? churchManagersData : churchManagersData.data || [];
  const updateStatusMutation = useUpdateChurchManagerStatus();
  
  const [selectedManager, setSelectedManager] = useState<ChurchManager | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalData, setApprovalData] = useState({
    eventId: '',
    costs: '',
    partTeacher: '',
  });

  const handleStatusUpdate = async (managerId: string, status: string) => {
    const updateData = status === 'approved' 
      ? {
          managerId,
          status,
          eventId: approvalData.eventId,
          costs: parseInt(approvalData.costs),
          partTeacher: parseInt(approvalData.partTeacher)
        }
      : { managerId, status };

    updateStatusMutation.mutate(updateData, {
      onSuccess: () => {
        setApprovalDialog(false);
        setSelectedManager(null);
        setApprovalData({ eventId: '', costs: '', partTeacher: '' });
      }
    });
  };

  const openApprovalDialog = (manager: ChurchManager) => {
    setSelectedManager(manager);
    setApprovalData({
      eventId: '',
      costs: '',
      partTeacher: manager.participants?.toString() || '1',
    });
    setApprovalDialog(true);
  };

  const handleViewReceipt = (managerId: string) => {
    // BTReceipt query를 직접 실행하는 대신 함수 컴포넌트로 분리 가능
    // 여기서는 간단하게 처리
    toast({
      title: '영수증 조회',
      description: '영수증 조회 기능을 구현해주세요.',
    });
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '승인됨';
      case 'rejected': return '거절됨';
      default: return '대기중';
    }
  };

  const pendingCount = churchManagers.filter(cm => cm.status === 'pending').length;
  const approvedCount = churchManagers.filter(cm => cm.status === 'approved').length;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">BT 신청 관리</h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">전체 신청</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{churchManagers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">대기중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">승인됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>신청 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>교회명</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>예상 참가자</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {churchManagers.map((manager) => (
                <TableRow key={manager._id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="font-medium">{manager.churchName}</div>
                    <div className="text-sm text-muted-foreground">{manager.churchAddress}</div>
                  </TableCell>
                  <TableCell>
                    <div>{manager.managerName}</div>
                    <div className="text-sm text-muted-foreground">{manager.managerEmail}</div>
                  </TableCell>
                  <TableCell>{manager.managerPhone}</TableCell>
                  <TableCell>{manager.participants || '-'}</TableCell>
                  <TableCell>
                    {new Date(manager.registrationDate).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(manager.status)}>
                      {getStatusText(manager.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {manager.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openApprovalDialog(manager)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(manager._id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {manager.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(manager._id)}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {churchManagers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    신청 내역이 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>승인 정보 입력</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>교회명</Label>
              <Input value={selectedManager?.churchName || ''} disabled />
            </div>
            <div>
              <Label>이벤트 ID</Label>
              <Input
                value={approvalData.eventId}
                onChange={(e) => setApprovalData(prev => ({ ...prev, eventId: e.target.value }))}
                placeholder="이벤트 ID 입력"
              />
            </div>
            <div>
              <Label>참가 교사 수</Label>
              <Input
                type="number"
                value={approvalData.partTeacher}
                onChange={(e) => setApprovalData(prev => ({ ...prev, partTeacher: e.target.value }))}
              />
            </div>
            <div>
              <Label>비용</Label>
              <Input
                type="number"
                value={approvalData.costs}
                onChange={(e) => setApprovalData(prev => ({ ...prev, costs: e.target.value }))}
                placeholder="비용 입력"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialog(false)}>취소</Button>
            <Button 
              onClick={() => selectedManager && handleStatusUpdate(selectedManager._id, 'approved')}
              disabled={!approvalData.eventId || !approvalData.costs}
            >
              승인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BTManage;
