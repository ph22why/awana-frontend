import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { Autocomplete } from '@mui/material';
import { Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { EventFormData, SampleEvent } from '../../types/event';
import type { ReceiptFormData } from '../../types/receipt';
import { eventApi, IEvent } from '../../services/api/eventApi';
import { churchApi, Church, ChurchResponse } from '../../services/api/churchApi';
import { receiptApi, Receipt, ReceiptResponse } from '../../services/api/receiptApi';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

interface ReceiptFormState {
  churchId: {
    mainId: string;
    subId: string;
  };
  churchName: string;
  managerName: string;
  managerPhone: string;
  partTotal: string;
  partStudent: string;
  partTeacher: string;
  partYM: string;
  costs: string;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

const ReceiptManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);

  const [formState, setFormState] = useState<ReceiptFormState>({
    churchId: {
      mainId: '',
      subId: ''
    },
    churchName: '',
    managerName: '',
    managerPhone: '',
    partTotal: '',
    partStudent: '',
    partTeacher: '',
    partYM: '',
    costs: '',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [churchIdInput, setChurchIdInput] = useState('');
  const [partTotal, setPartTotal] = useState('');
  const [partStudent, setPartStudent] = useState('');
  const [partTeacher, setPartTeacher] = useState('');
  const [partYM, setPartYM] = useState('');
  const [costs, setcosts] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchText, setSearchText] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);

  const [receiptsToAdd, setReceiptsToAdd] = useState<Array<{
    churchId: {
      mainId: string;
      subId: string;
    };
    churchName: string;
    managerName: string;
    managerPhone: string;
    partTotal: string;
    partStudent: string;
    partTeacher: string;
    partYM: string;
    costs: string;
  }>>([]);

  const [currentReceipt, setCurrentReceipt] = useState<ReceiptFormState>({
    churchId: {
      mainId: '',
      subId: ''
    },
    churchName: '',
    managerName: '',
    managerPhone: '',
    partTotal: '',
    partStudent: '',
    partTeacher: '',
    partYM: '',
    costs: '',
  });

  const [churchSearchPage, setChurchSearchPage] = useState(1);
  const [churchSearchHasMore, setChurchSearchHasMore] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);

  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const addNewReceiptRow = () => {
    setReceiptsToAdd(prev => [...prev, {
      churchId: {
        mainId: '',
        subId: ''
      },
      churchName: '',
      managerName: '',
      managerPhone: '',
      partTotal: '',
      partStudent: '',
      partTeacher: '',
      partYM: '',
      costs: '',
    }]);
  };

  const removeReceiptRow = (index: number) => {
    setReceiptsToAdd(prev => prev.filter((_, i) => i !== index));
  };

  const updateReceiptRow = (index: number, field: keyof typeof formState, value: string) => {
    setReceiptsToAdd(prev => prev.map((receipt, i) => {
      if (i === index) {
        return { ...receipt, [field]: value };
      }
      return receipt;
    }));
  };

  const handleChurchSearch = async (value: string) => {
    if (!value) {
      setChurches([]);
      return;
    }

    try {
      setLoading(true);
      const isMainId = /^\d{4}$/.test(value);
      let searchParams = {};
      
      if (isMainId) {
        searchParams = { mainId: value };
      } else {
        searchParams = { name: value };
      }

      const response = await churchApi.searchChurches({
        ...searchParams,
        getAllResults: true // Get all results without pagination
      });

      if (response.success) {
        setChurches(response.data);
        
        // If exact match is found, auto-select it
        if (isMainId && response.data.length === 1) {
          const church = response.data[0];
          handleChurchSelect(church);
        }
      }
    } catch (err) {
      console.error('Error searching churches:', err);
      setError('교회 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChurchSelect = (church: Church | null) => {
    if (church) {
      setCurrentReceipt(prev => ({
        ...prev,
        churchId: {
          mainId: church.mainId,
          subId: church.subId
        },
        churchName: church.name,
        managerName: church.managerName || ''
      }));
    }
  };

  const handleSaveAll = async () => {
    if (!selectedEvent) {
      setError('이벤트를 선택해주세요.');
      return;
    }

    // 모든 필수 필드가 채워져 있는지 확인
    const isValid = receiptsToAdd.every(receipt => 
      receipt.churchId.mainId && 
      receipt.churchId.subId && 
      receipt.churchName && 
      receipt.managerPhone &&
      receipt.partTotal &&
      receipt.partStudent &&
      receipt.partTeacher &&
      receipt.partYM &&
      receipt.costs
    );

    if (!isValid) {
      setError('모든 필수 정보를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const successfulReceipts = [];
      const failedReceipts = [];

      for (const receipt of receiptsToAdd) {
        try {
          const receiptData: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'> = {
            eventId: selectedEvent.toString(),
            churchId: {
              mainId: receipt.churchId.mainId,
              subId: receipt.churchId.subId
            },
            churchName: receipt.churchName,
            managerName: receipt.managerName,
            managerPhone: receipt.managerPhone,
            partTotal: parseInt(receipt.partTotal) || 0,
            partStudent: parseInt(receipt.partStudent) || 0,
            partTeacher: parseInt(receipt.partTeacher) || 0,
            partYM: parseInt(receipt.partYM) || 0,
            costs: parseInt(receipt.costs) || 0,
            paymentMethod: 'cash',
            paymentStatus: 'pending',
            paymentDate: new Date().toISOString(),
            description: ''
          };

          const response = await receiptApi.createReceipt(receiptData);
          if (response.success) {
            successfulReceipts.push(receipt.churchName);
          } else {
            failedReceipts.push(receipt.churchName);
          }
        } catch (err) {
          failedReceipts.push(receipt.churchName);
        }
      }

      if (successfulReceipts.length > 0) {
        setSnackbar({
          open: true,
          message: `${successfulReceipts.length}개의 영수증이 성공적으로 등록되었습니다.`,
          severity: 'success'
        });

        // 성공적으로 저장된 후에 모든 입력 필드 초기화
        setReceiptsToAdd(receiptsToAdd.map(() => ({
          churchId: {
            mainId: '',
            subId: ''
          },
          churchName: '',
          managerName: '',
          managerPhone: '',
          partTotal: '',
          partStudent: '',
          partTeacher: '',
          partYM: '',
          costs: '',
        })));

        // 영수증 목록 새로고침
        const receiptsResponse = await receiptApi.getReceipts({ eventId: selectedEvent });
        if (receiptsResponse.success) {
          setReceipts(receiptsResponse.data);
        }
      }

      if (failedReceipts.length > 0) {
        setError(`${failedReceipts.length}개의 영수증 등록에 실패했습니다.`);
      }
    } catch (err) {
      console.error('Error saving receipts:', err);
      setError('영수증 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChurches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await churchApi.searchChurches({
        page,
        limit: pageSize,
        ...(debouncedSearchTerm ? { name: debouncedSearchTerm } : {})
      });
      
      console.log('API Response:', response);
      
      if (response.success) {
        setChurches(response.data);
        setTotalPages(Math.max(1, Math.ceil(response.pagination.total / pageSize)));
      } else {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching churches:', err);
      setError('교회 목록을 불러오는데 실패했습니다.');
      setChurches([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const formatCost = (value: string) => {
    // Remove all non-digits (including any existing commas)
    const numbers = value.replace(/[^\d]/g, '');
    
    // If empty, return empty string
    if (!numbers) return '';
    
    // Parse as number to remove leading zeros
    const numericValue = parseInt(numbers);
    
    // Format with commas for thousands
    return numericValue.toLocaleString('ko-KR');
  };

  const parsecosts = (value: string) => {
    // Remove all non-digits and convert to number
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const resetForm = () => {
    setCurrentReceipt({
      churchId: {
        mainId: '',
        subId: ''
      },
      churchName: '',
      managerName: '',
      managerPhone: '',
      partTotal: '',
      partStudent: '',
      partTeacher: '',
      partYM: '',
      costs: '',
    });
    setIsEditMode(false);
    setEditingReceiptId(null);
    setSelectedChurch(null);
  };

  const handleEdit = async (receipt: Receipt) => {
    console.log('Editing receipt:', receipt);
    setIsEditMode(true);
    setEditingReceiptId(receipt._id || receipt.id);
    
    // Autocomplete를 위한 교회 데이터 설정
    const church: Church = {
      _id: receipt._id || receipt.id,
      mainId: receipt.churchId.mainId,
      subId: receipt.churchId.subId,
      name: receipt.churchName,
      managerName: receipt.managerName,
      location: '', // 필수 필드이므로 빈 문자열로 설정
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt
    };
    setSelectedChurch(church);

    // 폼 데이터 설정
    const formData = {
      churchId: {
        mainId: receipt.churchId.mainId,
        subId: receipt.churchId.subId
      },
      churchName: receipt.churchName,
      managerName: receipt.managerName,
      managerPhone: receipt.managerPhone,
      partTotal: String(receipt.partTotal),
      partStudent: String(receipt.partStudent),
      partTeacher: String(receipt.partTeacher),
      partYM: String(receipt.partYM),
      costs: receipt.costs.toLocaleString()
    };

    console.log('Setting form data:', formData);
    setCurrentReceipt(formData);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!selectedEvent || !currentReceipt.churchId.mainId || !currentReceipt.managerPhone || !currentReceipt.managerName) {
      setError('필수 정보를 모두 입력해주세요.');
      return;
    }

    const costs = parsecosts(currentReceipt.costs);
    if (costs <= 0) {
      setError('금액은 0보다 커야 합니다.');
      return;
    }

    try {
      setLoading(true);
      console.log('Current receipt state:', currentReceipt);

      const receiptData = {
        eventId: selectedEvent.toString(),
        churchId: currentReceipt.churchId,
        churchName: currentReceipt.churchName,
        managerName: currentReceipt.managerName,
        managerPhone: currentReceipt.managerPhone,
        partTotal: parseInt(currentReceipt.partTotal) || 0,
        partStudent: parseInt(currentReceipt.partStudent) || 0,
        partTeacher: parseInt(currentReceipt.partTeacher) || 0,
        partYM: parseInt(currentReceipt.partYM) || 0,
        costs,
        paymentMethod: 'cash' as const,
        paymentStatus: 'pending' as const,
        paymentDate: new Date().toISOString(),
        description: ''
      };

      console.log('Sending data to API:', receiptData);

      let response;
      if (isEditMode && editingReceiptId) {
        response = await receiptApi.updateReceipt(editingReceiptId, receiptData);
      } else {
        response = await receiptApi.createReceipt(receiptData);
      }

      console.log('API Response:', response);

      if (response.success) {
        setSnackbar({
          open: true,
          message: isEditMode ? '영수증이 수정되었습니다.' : '영수증이 등록되었습니다.',
          severity: 'success'
        });

        // Reset form and state
        resetForm();

        // Refresh receipt list immediately
        if (selectedEvent) {
          await fetchReceipts(selectedEvent, true);
        }
      }
    } catch (err: any) {
      console.error('Error saving receipt:', err);
      const errorMessage = err.response?.data?.errors?.map((e: any) => e.message).join('\n') || 
                          err.response?.data?.message || 
                          '영수증 저장에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleView = (id: string) => {
    navigate(`/admin/receipts/${id}`);
  };

  useEffect(() => {
    fetchChurches();
  }, []);
  
  useEffect(() => {
    const selected = churches.find(ch => ch._id === selectedChurchId);
    if (selected) {
      setChurchIdInput(`${selected.mainId}`);
    } else {
      setChurchIdInput('');
    }
  }, [selectedChurchId]);
  
  const fetchSampleEvents = async () => {
    try {
      console.log('Fetching sample events...');
      const response = await eventApi.getSampleEvents();
      console.log('Sample events response:', response);
      if (response.success) {
        setSampleEvents(response.data);
      } else {
        throw new Error('샘플 이벤트 목록을 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error fetching sample events:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setSnackbar({
        open: true,
        message: `이벤트 목록을 불러오는 중 오류가 발생했습니다: ${err.message}`,
        severity: 'error'
      });
    }
  };

  const handleDownload = (id: string) => {
    // TODO: Implement download functionality
    console.log('Download receipt:', id);
  };

  const [sampleEvents, setSampleEvents] = useState<SampleEvent[]>([]);
  const [matchedChurches, setMatchedChurches] = useState<Church[]>([]);

  const [formData, setFormData] = useState<Partial<EventFormData>>({
      event_Open_Available: '비공개'
    });
  const downloadSampleExcel = () => {
    const headers = [
      '등록번호','등록번호 중복시 아이디','년도', '이벤트명',
      '참가인원-전체', '참가인원-학생', '참가인원-선생', '참가인원-ym', '비용'
    ];
  
    const sampleData = [headers]; // 헤더만 있는 빈 데이터 생성
  
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
  
    XLSX.utils.book_append_sheet(workbook, worksheet, '샘플');
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
    saveAs(data, '영수증업로드양식.xlsx');
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
  
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as Array<Array<any>>;
  
      const [header, ...rows] = jsonData;
  
      const expectedHeaders = [
           '등록번호','등록번호 중복시 아이디','년도', '이벤트명',
          '참가인원-전체', '참가인원-학생', '참가인원-선생', '참가인원-ym', '비용'
      ];
  
      if (JSON.stringify(header) !== JSON.stringify(expectedHeaders)) {
        alert('엑셀 양식이 올바르지 않습니다. 샘플 파일을 확인하세요.');
        return;
      }
  
      const parsedData = rows.map((row) => ({
        church_reg_ID: row[0],
        church_sub_ID: row[1],
        event_Year: row[2],
        event_Name: row[3],
        part_total: row[4],
        part_student: row[5],
        part_teacher: row[6],
        part_ym: row[7],
        costs: row[8],
      }));
  
      console.log(parsedData);
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  const handleChurchIdInputChange = async (value: string) => {
    if (value.length <= 4) {
      setChurchIdInput(value);
      if (value.length === 4) {
        setLoading(true);
        try {
          const response = await churchApi.searchChurches({ mainId: value });
          if (response.success) {
            setChurches(response.data);
            if (response.data.length === 1) {
              setSelectedChurchId(response.data[0]._id);
            }
          }
        } catch (err) {
          console.error('Error searching churches:', err);
          setError('교회 정보를 불러오는데 실패했습니다.');
        } finally {
          setLoading(false);
        }
      }
    }
  };
  
  const handleEventNameSelect = (event: SelectChangeEvent<string>) => {
    const eventId = parseInt(event.target.value, 10);
    const selectedEvent = sampleEvents.find(event => event.sampleEvent_ID === eventId);
    if (selectedEvent) {
      const currentYear = new Date().getFullYear();
      setFormData(prev => ({
        ...prev,
        event_Name: `${selectedEvent.sampleEvent_Name} ${currentYear}`,
        event_Place: selectedEvent.sampleEvent_Place || '미정',
        event_Location: selectedEvent.sampleEvent_Location || '미정',
        event_Open_Available: selectedEvent.sampleEvent_Open_Available as '공개' | '비공개',
        event_Month: parseInt(selectedEvent.sampleEvent_Month) || new Date().getMonth() + 1,
        event_Year: currentYear
      }));
    }
  };

  const [churchName, setChurchName] = useState('');

  // 초기 연도 목록 로드
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        setLoading(true);
        const allEvents = await eventApi.getEvents();
        const years = Array.from(new Set(allEvents.map(event => event.event_Year)));
        const sortedYears = years.sort((a, b) => b - a); // 내림차순 정렬
        setAvailableYears(sortedYears);
        
        // 연도가 있으면 가장 최근 연도 선택
        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
        }
      } catch (err) {
        console.error('Error fetching years:', err);
        setError('연도 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableYears();
  }, []);

  // 선택된 연도에 해당하는 이벤트 로드
  useEffect(() => {
    const fetchEventsByYear = async () => {
      if (!selectedYear) return;

      try {
        setLoading(true);
        const allEvents = await eventApi.getEvents({ year: selectedYear });
        const sortedEvents = allEvents.sort((a, b) => 
          new Date(b.event_Start_Date).getTime() - new Date(a.event_Start_Date).getTime()
        );
        setEvents(sortedEvents);
        setSelectedEvent(''); // 이벤트 선택 초기화
      } catch (err) {
        console.error('Error fetching events for year:', err);
        setError('이벤트 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventsByYear();
  }, [selectedYear]);

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const year = event.target.value as number;
    setSelectedYear(year);
  };

  const handleEventChange = (event: SelectChangeEvent<string>) => {
    setSelectedEvent(event.target.value);
    setShowForm(false); // Reset form when event changes
    setSelectedChurch(null); // Reset selected church
    setCurrentReceipt({ // Reset form state
      churchId: {
        mainId: '',
        subId: ''
      },
      churchName: '',
      managerName: '',
      managerPhone: '',
      partTotal: '',
      partStudent: '',
      partTeacher: '',
      partYM: '',
      costs: '',
    });
  };

  const fetchReceipts = async (eventId: string, resetPage: boolean = false) => {
    try {
      setLoading(true);
      console.log('Fetching receipts for eventId:', eventId);
      
      if (resetPage) {
        setPage(1);
      }
      
      const response = await receiptApi.getReceipts({ 
        eventId: eventId,
        page: resetPage ? 1 : page,
        limit: pageSize
      });
      
      console.log('Raw API response:', response);
      
      // Handle both array response and object response formats
      let receiptData: Receipt[] = [];
      if (Array.isArray(response)) {
        receiptData = response;
        setTotalPages(Math.ceil(response.length / pageSize));
      } else if (response && response.data) {
        receiptData = response.data;
        if (response.count) {
          setTotalPages(Math.ceil(response.count / pageSize));
        }
      } else {
        throw new Error('영수증 목록을 불러오는데 실패했습니다.');
      }

      // Transform and validate the data
      const validatedReceipts = receiptData.map(receipt => ({
        ...receipt,
        churchName: receipt.churchName || '',
        partTotal: receipt.partTotal || 0,
        partStudent: receipt.partStudent || 0,
        partTeacher: receipt.partTeacher || 0,
        partYM: receipt.partYM || 0,
        costs: receipt.costs || 0,
      }));

      console.log('Processed receipts:', validatedReceipts);
      setReceipts(validatedReceipts);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('영수증 목록을 불러오는데 실패했습니다.');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreChurches = () => {
    if (!churchSearchHasMore || loading) return;
    setChurchSearchPage(prev => prev + 1);
  };

  // Reset search page when search term changes
  useEffect(() => {
    setChurchSearchPage(1);
    setChurchSearchHasMore(true);
  }, [searchInput]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format the number
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 선택된 이벤트가 변경될 때마다 영수증 목록 조회
  useEffect(() => {
    if (selectedEvent) {
      console.log('Selected event changed, fetching receipts for:', selectedEvent);
      fetchReceipts(selectedEvent, true); // Pass true to reset pagination
    }
  }, [selectedEvent]);

  // 저장 성공 후 목록 갱신을 위한 useEffect
  useEffect(() => {
    if (selectedEvent && snackbar.severity === 'success') {
      console.log('Receipt saved successfully, refreshing list for:', selectedEvent);
      fetchReceipts(selectedEvent, true); // Pass true to reset pagination
    }
  }, [snackbar.severity]);

  // Add effect to handle page changes
  useEffect(() => {
    if (selectedEvent && page > 1) {
      console.log('Page changed, fetching receipts for:', selectedEvent);
      fetchReceipts(selectedEvent, false);
    }
  }, [page]);

  // Add filtered receipts effect
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredReceipts(receipts);
      return;
    }

    const filtered = receipts.filter(receipt => 
      receipt.churchName.toLowerCase().includes(searchText.toLowerCase()) ||
      receipt.churchId.mainId.includes(searchText) ||
      receipt.partTotal.toString().includes(searchText) ||
      receipt.partStudent.toString().includes(searchText) ||
      receipt.partTeacher.toString().includes(searchText) ||
      receipt.partYM.toString().includes(searchText)
    );
    setFilteredReceipts(filtered);
  }, [searchText, receipts]);

  // Add delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm('정말로 이 영수증을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      await receiptApi.deleteReceipt(id);
      setSnackbar({
        open: true,
        message: '영수증이 삭제되었습니다.',
        severity: 'success'
      });
      // Refresh the list
      if (selectedEvent) {
        fetchReceipts(selectedEvent, true);
      }
    } catch (err) {
      console.error('Error deleting receipt:', err);
      setSnackbar({
        open: true,
        message: '영수증 삭제에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 상세 조회 다이얼로그 핸들러
  const handleViewDetail = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedReceipt(null);
    setDetailDialogOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        영수증 관리
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>연도</InputLabel>
              <Select
                value={selectedYear}
                label="연도"
                onChange={handleYearChange}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}년
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>이벤트</InputLabel>
              <Select
                value={selectedEvent}
                label="이벤트"
                onChange={handleEventChange}
                disabled={!selectedYear || !events || events.length === 0}
              >
                {events && events.map((event) => (
                  <MenuItem key={event._id} value={event._id}>
                    {event.event_Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {selectedEvent && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {isEditMode ? '영수증 수정' : '영수증 추가'}
          </Typography>
          <Box component="form" onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  freeSolo
                  value={selectedChurch}
                  onChange={(_, newValue) => {
                    console.log('Autocomplete onChange:', newValue);
                    if (typeof newValue === 'string') {
                      setCurrentReceipt(prev => ({
                        ...prev,
                        churchName: newValue
                      }));
                      handleChurchSearch(newValue);
                    } else if (newValue && 'name' in newValue) {
                      setSelectedChurch(newValue);
                      setCurrentReceipt(prev => ({
                        ...prev,
                        churchId: {
                          mainId: newValue.mainId,
                          subId: newValue.subId
                        },
                        churchName: newValue.name,
                        managerName: newValue.managerName || ''
                      }));
                    }
                  }}
                  onInputChange={(_, newValue) => {
                    if (newValue.length >= 2) {
                      handleChurchSearch(newValue);
                    }
                  }}
                  options={churches}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return `${option.name} (${option.mainId})`;
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.mainId === value.mainId && option.subId === value.subId;
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Typography>
                        {option.name} <Typography component="span" color="textSecondary">({option.mainId})</Typography>
                      </Typography>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="교회명 또는 등록번호 검색"
                      fullWidth
                      required
                      helperText="교회명이나 4자리 등록번호를 입력하세요"
                    />
                  )}
                  loading={loading}
                  loadingText="검색중..."
                  noOptionsText="검색 결과가 없습니다"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="교회 등록번호"
                  value={currentReceipt.churchId.mainId}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="filled"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="교회 하위 ID"
                  value={currentReceipt.churchId.subId}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="filled"
                  helperText="교회 정보에서 자동으로 설정됩니다"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="담당자 이름"
                  value={currentReceipt.managerName}
                  onChange={(e) => setCurrentReceipt(prev => ({ ...prev, managerName: e.target.value }))}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="담당자 전화번호"
                  value={currentReceipt.managerPhone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    if (formatted.length <= 13) {
                      setCurrentReceipt(prev => ({ ...prev, managerPhone: formatted }));
                    }
                  }}
                  placeholder="010-0000-0000"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="전체 인원"
                  type="number"
                  value={currentReceipt.partTotal}
                  onChange={(e) => setCurrentReceipt(prev => ({ ...prev, partTotal: e.target.value }))}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="학생 수"
                      type="number"
                      value={currentReceipt.partStudent}
                      onChange={(e) => setCurrentReceipt(prev => ({ ...prev, partStudent: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="선생 수"
                      type="number"
                      value={currentReceipt.partTeacher}
                      onChange={(e) => setCurrentReceipt(prev => ({ ...prev, partTeacher: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="YM 수"
                      type="number"
                      value={currentReceipt.partYM}
                      onChange={(e) => setCurrentReceipt(prev => ({ ...prev, partYM: e.target.value }))}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="비용"
                  value={currentReceipt.costs}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Remove all non-digits
                    const numericValue = value.replace(/[^\d]/g, '');
                    // Format with commas
                    const formattedValue = numericValue ? parseInt(numericValue).toLocaleString('ko-KR') : '';
                    setCurrentReceipt(prev => ({ ...prev, costs: formattedValue }));
                  }}
                  InputProps={{
                    endAdornment: <Typography>원</Typography>
                  }}
                  required
                  helperText="금액 입력"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : (isEditMode ? '수정' : '저장')}
                </Button>
                {isEditMode && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={resetForm}
                    sx={{ mt: 1 }}
                  >
                    취소
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {selectedEvent && (
        <>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="검색"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 300 }}
              placeholder="교회명, 등록번호, 인원수로 검색"
            />
            <FormControl size="small" sx={{ width: 100 }}>
              <InputLabel>페이지당</InputLabel>
              <Select
                value={pageSize}
                label="페이지당"
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1); // Reset to first page when changing page size
                  if (selectedEvent) {
                    fetchReceipts(selectedEvent, true);
                  }
                }}
              >
                <MenuItem value={10}>10개</MenuItem>
                <MenuItem value={30}>30개</MenuItem>
                <MenuItem value={50}>50개</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} sx={{ mb: 3, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>교회명</TableCell>
                  <TableCell>등록번호</TableCell>
                  <TableCell align="right">비용</TableCell>
                  <TableCell align="right">등록일</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReceipts && filteredReceipts.length > 0 ? (
                  filteredReceipts.map((receipt) => (
                    <TableRow key={receipt._id || receipt.id}>
                      <TableCell>{receipt.churchName}</TableCell>
                      <TableCell>
                        {receipt.churchId.mainId}
                        {receipt.churchId.subId && `-${receipt.churchId.subId}`}
                      </TableCell>
                      <TableCell align="right">{receipt.costs.toLocaleString()}원</TableCell>
                      <TableCell align="right">
                        {new Date(receipt.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleViewDetail(receipt)}
                            title="상세보기"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleDelete(receipt._id || receipt.id)}
                            title="삭제"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {error ? error : '등록된 영수증이 없습니다.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* 상세 조회 다이얼로그 */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          영수증 상세 정보
          <IconButton
            aria-label="close"
            onClick={handleCloseDetail}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReceipt && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">교회 정보</Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography><strong>교회명:</strong> {selectedReceipt.churchName}</Typography>
                  <Typography><strong>등록번호:</strong> {selectedReceipt.churchId.mainId}
                    {selectedReceipt.churchId.subId && `-${selectedReceipt.churchId.subId}`}</Typography>
                </Box>

                <Typography variant="subtitle2" color="textSecondary">담당자 정보</Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography><strong>이름:</strong> {selectedReceipt.managerName}</Typography>
                  <Typography><strong>연락처:</strong> {selectedReceipt.managerPhone}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">참가 인원</Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography><strong>전체:</strong> {selectedReceipt.partTotal}명</Typography>
                  <Typography><strong>학생:</strong> {selectedReceipt.partStudent}명</Typography>
                  <Typography><strong>선생:</strong> {selectedReceipt.partTeacher}명</Typography>
                  <Typography><strong>YM:</strong> {selectedReceipt.partYM}명</Typography>
                </Box>

                <Typography variant="subtitle2" color="textSecondary">결제 정보</Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography><strong>금액:</strong> {selectedReceipt.costs.toLocaleString()}원</Typography>
                  <Typography><strong>등록일:</strong> {new Date(selectedReceipt.createdAt).toLocaleDateString()}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if (selectedReceipt) {
              handleEdit(selectedReceipt);
              handleCloseDetail();
            }
          }} color="primary">
            수정하기
          </Button>
          <Button onClick={handleCloseDetail} color="inherit">
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReceiptManagePage; 