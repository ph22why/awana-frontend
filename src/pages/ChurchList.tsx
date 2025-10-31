import { useState, useEffect } from 'react';
import { churchApi } from '@/services/api/churchApi';
import type { Church } from '@/types/church';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';

const ChurchList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allChurches, setAllChurches] = useState<Church[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAllChurches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await churchApi.searchChurches({ getAllResults: true });
      if (response.success) {
        setAllChurches(response.data || []);
      } else {
        setAllChurches([]);
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Error fetching churches:', err);
      setError('교회 목록을 불러오는데 실패했습니다.');
      setAllChurches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllChurches();
  }, []);

  useEffect(() => {
    let filtered = allChurches || [];
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(church =>
        (church.name && church.name.toLowerCase().includes(term)) ||
        (church.mainId && church.mainId.toLowerCase().includes(term))
      );
    }
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    setChurches(filtered.slice(startIdx, endIdx));
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
  }, [allChurches, searchTerm, page, pageSize]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">교회 목록</h1>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="교회명 또는 등록번호로 검색"
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
        </div>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10개</SelectItem>
            <SelectItem value="30">30개</SelectItem>
            <SelectItem value="50">50개</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {churches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                churches.map((church) => (
                  <TableRow key={church._id}>
                    <TableCell className="font-medium">{church.name}</TableCell>
                    <TableCell>{church.mainId}-{church.subId}</TableCell>
                    <TableCell>{church.location}</TableCell>
                    <TableCell>{church.phone || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ChurchList;
