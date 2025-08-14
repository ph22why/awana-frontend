import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { eventApi, IEvent, IEventGroup } from '../../services/api/eventApi';
import { Checkbox, FormControlLabel, TextField, Box } from '@mui/material';
import moment from 'moment';

const getEventStatus = (event: IEvent) => {
  const now = moment();
  const startDate = moment(event.event_Start_Date);
  const endDate = moment(event.event_End_Date);

  if (now.isBefore(startDate)) {
    return '예정';
  } else if (now.isAfter(endDate)) {
    return '완료';
  } else {
    return '진행중';
  }
};

const EventManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useOutletContext<{ role: string }>();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<IEventGroup[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLocation, setNewGroupLocation] = useState('');
  const [dialogSelectedEventIds, setDialogSelectedEventIds] = useState<Set<string>>(new Set());
  const [dialogSearch, setDialogSearch] = useState('');
  const [openGroupIds, setOpenGroupIds] = useState<Set<string>>(new Set());
  const [isGroupEditMode, setIsGroupEditMode] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    eventId: string | null;
    eventName: string;
  }>({
    open: false,
    eventId: null,
    eventName: ''
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching events...');
      
      const fetchedEvents = await eventApi.getEvents();
      console.log('Fetched events:', fetchedEvents);
      
      if (!fetchedEvents || fetchedEvents.length === 0) {
        console.log('No events found');
        setEvents([]);
        return;
      }

      // 날짜 기준으로 내림차순 정렬 (최신순)
      const sortedEvents = [...fetchedEvents].sort((a, b) => {
        const dateA = new Date(b.createdAt || b.event_Start_Date).getTime();
        const dateB = new Date(a.createdAt || a.event_Start_Date).getTime();
        return dateA - dateB;
      });
      
      console.log('Sorted events to display:', sortedEvents);
      setEvents(sortedEvents);
    } catch (err: any) {
      const errorMessage = err.message || '이벤트 목록을 불러오는데 실패했습니다.';
      console.error('Error fetching events:', {
        error: err,
        message: errorMessage
      });
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시와 이벤트 생성/수정/삭제 후에 목록 새로고침
  useEffect(() => {
    fetchEvents();
    // 그룹 목록도 로드
    (async () => {
      const gs = await eventApi.getEventGroups();
      setGroups(gs);
    })();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/admin/events/edit/${id}`);
  };

  const handleDeleteClick = (id: string, eventName: string) => {
    setDeleteDialog({
      open: true,
      eventId: id,
      eventName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.eventId) return;

    try {
      setLoading(true);
      await eventApi.deleteEvent(deleteDialog.eventId);
      await fetchEvents(); // 목록 새로고침
      setDeleteDialog({ open: false, eventId: null, eventName: '' });
    } catch (err: any) {
      setError(err.message || '이벤트 삭제에 실패했습니다.');
      console.error('Error deleting event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, eventId: null, eventName: '' });
  };

  const toggleEventSelection = (id: string) => {
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openGroupDialog = () => {
    setNewGroupName('');
    setNewGroupLocation('');
    setDialogSelectedEventIds(new Set(selectedEventIds));
    setDialogSearch('');
    setIsGroupEditMode(false);
    setEditingGroupId(null);
    setGroupDialogOpen(true);
  };

  const closeGroupDialog = () => {
    setGroupDialogOpen(false);
    setIsGroupEditMode(false);
    setEditingGroupId(null);
  };

  const handleCreateGroup = async () => {
    try {
      if (!newGroupName.trim() || dialogSelectedEventIds.size === 0) {
        setError('그룹명과 이벤트 선택이 필요합니다.');
        return;
      }
      const payload = {
        name: newGroupName.trim(),
        location: newGroupLocation.trim() || undefined,
        eventIds: Array.from(dialogSelectedEventIds)
      };
      const created = await eventApi.createEventGroup(payload);
      setGroups((prev) => [created, ...prev]);
      setGroupDialogOpen(false);
      setSelectedEventIds(new Set());
    } catch (err: any) {
      setError(err.message || '그룹 생성에 실패했습니다.');
    }
  };

  const openEditGroupDialog = (group: IEventGroup) => {
    setIsGroupEditMode(true);
    setEditingGroupId(group._id);
    setNewGroupName(group.name);
    setNewGroupLocation(group.location || '');
    setDialogSelectedEventIds(new Set(group.eventIds));
    setDialogSearch('');
    setGroupDialogOpen(true);
  };

  const handleUpdateGroup = async () => {
    try {
      if (!editingGroupId) return;
      if (!newGroupName.trim() || dialogSelectedEventIds.size === 0) {
        setError('그룹명과 이벤트 선택이 필요합니다.');
        return;
      }
      const payload = {
        name: newGroupName.trim(),
        location: newGroupLocation.trim() || undefined,
        eventIds: Array.from(dialogSelectedEventIds)
      };
      const updated = await eventApi.updateEventGroup(editingGroupId, payload);
      setGroups((prev) => prev.map(g => g._id === updated._id ? updated : g));
      setGroupDialogOpen(false);
      setIsGroupEditMode(false);
      setEditingGroupId(null);
    } catch (err: any) {
      setError(err.message || '그룹 수정에 실패했습니다.');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('이 그룹을 삭제하시겠습니까? 그룹 자체만 삭제되며 이벤트는 유지됩니다.')) return;
    try {
      await eventApi.deleteEventGroup(groupId);
      setGroups((prev) => prev.filter(g => g._id !== groupId));
    } catch (err: any) {
      setError(err.message || '그룹 삭제에 실패했습니다.');
    }
  };

  const toggleGroupOpen = (groupId: string) => {
    setOpenGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });
  };

  if (role === 'mini') {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 2 }}>접근 권한이 없습니다.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        이벤트 관리
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/events/create')}
        >
          새 이벤트 만들기
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<GroupAddIcon />}
          onClick={openGroupDialog}
          disabled={events.length === 0}
        >
          그룹 만들기
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
              <TableRow>
              <TableCell>이벤트명</TableCell>
              <TableCell>시작일</TableCell>
              <TableCell>종료일</TableCell>
              <TableCell>접수</TableCell>
              <TableCell>지역</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>공개여부</TableCell> 
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 그룹 섹션 */}
            {groups && groups.length > 0 && (
              groups.map((group) => {
                const groupEvents = events.filter(e => group.eventIds.includes(e._id));
                if (groupEvents.length === 0) return null;
                const isOpen = openGroupIds.has(group._id);
                return (
                  <React.Fragment key={`group-${group._id}`}>
                    <TableRow hover onClick={() => toggleGroupOpen(group._id)} style={{ cursor: 'pointer', background: '#fafafa' }}>
                      <TableCell colSpan={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isOpen ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{group.name}</Typography>
                          <Typography variant="body2" color="text.secondary">({groupEvents.length}개 이벤트)</Typography>
                          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditGroupDialog(group); }} title="그룹 편집">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group._id); }} title="그룹 삭제">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ p: 0 }}>
                          <Table size="small">
                            <TableBody>
                              {groupEvents.map(event => (
                                <TableRow key={`group-${group._id}-event-${event._id}`}>
                                  <TableCell>{event.event_Name}</TableCell>
                                  <TableCell>{moment(event.event_Start_Date).format('YYYY-MM-DD')}</TableCell>
                                  <TableCell>{moment(event.event_End_Date).format('YYYY-MM-DD')}</TableCell>
                                  <TableCell>
                                    {moment(event.event_Registration_Start_Date).format('YYYY-MM-DD')} ~ {moment(event.event_Registration_End_Date).format('YYYY-MM-DD')}
                                  </TableCell>
                                  <TableCell>{`${event.event_Place} (${event.event_Location})`}</TableCell>
                                  <TableCell>{getEventStatus(event)}</TableCell>
                                  <TableCell>{event.event_Open_Available}</TableCell>
                                  <TableCell align="right">
                                    <IconButton color="primary" onClick={(e) => { e.stopPropagation(); handleEdit(event._id); }}>
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleDeleteClick(event._id, event.event_Name); }}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}

            {/* 그룹에 속하지 않은 개별 이벤트 */}
            {(() => {
              const groupedIds = new Set(groups.flatMap(g => g.eventIds));
              const ungrouped = events.filter(e => !groupedIds.has(e._id));
              if (ungrouped.length === 0 && (!groups || groups.length === 0)) {
                return (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {error ? error : '등록된 이벤트가 없습니다.'}
                    </TableCell>
                  </TableRow>
                );
              }
              return ungrouped.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>{event.event_Name}</TableCell>
                  <TableCell>
                    {moment(event.event_Start_Date).format('YYYY-MM-DD')}
                  </TableCell>
                  <TableCell>
                    {moment(event.event_End_Date).format('YYYY-MM-DD')}
                  </TableCell>
                  <TableCell>
                    {moment(event.event_Registration_Start_Date).format('YYYY-MM-DD')} ~{' '}
                    {moment(event.event_Registration_End_Date).format('YYYY-MM-DD')}
                  </TableCell>
                  <TableCell>{`${event.event_Place} (${event.event_Location})`}</TableCell>
                  <TableCell>{getEventStatus(event)}</TableCell>
                  <TableCell>{event.event_Open_Available}</TableCell>
                  <TableCell align="right">
                    <FormControlLabel
                      control={<Checkbox checked={selectedEventIds.has(event._id)} onChange={() => toggleEventSelection(event._id)} />}
                      label="선택"
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(event._id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(event._id, event.event_Name)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 그룹 생성 다이얼로그 */}
      <Dialog open={groupDialogOpen} onClose={closeGroupDialog} fullWidth maxWidth="md">
        <DialogTitle>{isGroupEditMode ? '이벤트 그룹 편집' : '이벤트 그룹 생성'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="그룹명" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} fullWidth />
            <TextField label="지역(선택)" value={newGroupLocation} onChange={(e) => setNewGroupLocation(e.target.value)} fullWidth />
            <TextField label="이벤트 검색(이름/지역)" value={dialogSearch} onChange={(e) => setDialogSearch(e.target.value)} fullWidth />
            <Typography variant="body2" color="text.secondary">선택된 이벤트 수: {dialogSelectedEventIds.size}</Typography>
            <Box sx={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>선택</TableCell>
                    <TableCell>이벤트명</TableCell>
                    <TableCell>기간</TableCell>
                    <TableCell>지역</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events
                    .filter(e => {
                      const q = dialogSearch.trim().toLowerCase();
                      if (!q) return true;
                      return e.event_Name.toLowerCase().includes(q) || e.event_Place.toLowerCase().includes(q) || e.event_Location.toLowerCase().includes(q);
                    })
                    .map(e => {
                      const checked = dialogSelectedEventIds.has(e._id);
                      return (
                        <TableRow key={`dialog-event-${e._id}`} hover>
                          <TableCell>
                            <Checkbox
                              checked={checked}
                              onChange={() => {
                                setDialogSelectedEventIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(e._id)) next.delete(e._id); else next.add(e._id);
                                  return next;
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>{e.event_Name}</TableCell>
                          <TableCell>
                            {moment(e.event_Start_Date).format('YYYY-MM-DD')} ~ {moment(e.event_End_Date).format('YYYY-MM-DD')}
                          </TableCell>
                          <TableCell>{`${e.event_Place} (${e.event_Location})`}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGroupDialog}>취소</Button>
          {isGroupEditMode ? (
            <Button variant="contained" onClick={handleUpdateGroup} disabled={!newGroupName.trim() || dialogSelectedEventIds.size === 0}>저장</Button>
          ) : (
            <Button variant="contained" onClick={handleCreateGroup} disabled={!newGroupName.trim() || dialogSelectedEventIds.size === 0}>생성</Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>이벤트 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{deleteDialog.eventName}" 이벤트를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventManagePage; 