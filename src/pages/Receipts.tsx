import { useState, useEffect } from 'react';
import { receiptApi } from '@/services/api/receiptApi';
import { eventApi } from '@/services/api/eventApi';
import { churchApi } from '@/services/api/churchApi';
import type { Receipt } from '@/types/receipt';
import type { IEvent, IEventGroup } from '@/types/event';
import type { Church } from '@/types/church';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Receipts = () => {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedSelection, setSelectedSelection] = useState<string>('');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<IEventGroup[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [receiptYears, setReceiptYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventsData, groupsData] = await Promise.all([
          eventApi.getEvents(),
          eventApi.getEventGroups(),
        ]);
        setEvents(eventsData);
        setGroups(groupsData);

        const years = new Set<string>();
        eventsData.forEach(e => {
          if (e.event_Year) years.add(e.event_Year.toString());
        });
        setReceiptYears(Array.from(years).sort((a, b) => Number(b) - Number(a)));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!selectedSelection) {
      toast({
        variant: 'destructive',
        title: '이벤트를 선택해주세요',
      });
      return;
    }

    if (!registrationNumber || !phoneNumber) {
      toast({
        variant: 'destructive',
        title: '등록번호와 연락처를 입력해주세요',
      });
      return;
    }

    setIsLoading(true);
    try {
      const eventId = selectedSelection.split(':')[1];
      const response = await receiptApi.searchReceipts({
        eventId,
        registrationNumber,
        managerPhone: phoneNumber,
      });

      if (response.success && response.data.length > 0) {
        setReceipts(response.data);
        toast({
          title: '영수증을 찾았습니다',
          description: `${response.data.length}개의 영수증이 있습니다.`,
        });
      } else {
        setReceipts([]);
        toast({
          variant: 'destructive',
          title: '영수증을 찾을 수 없습니다',
        });
      }
    } catch (err) {
      console.error('Error searching receipts:', err);
      toast({
        variant: 'destructive',
        title: '영수증 검색 실패',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(e => e.event_Year.toString() === selectedYear);
  const filteredGroups = groups.filter(g => {
    const groupEvents = events.filter(e => g.eventIds.includes(e._id));
    return groupEvents.some(e => e.event_Year.toString() === selectedYear);
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">영수증 발급</CardTitle>
          <CardDescription>
            이벤트 참가 영수증을 조회하고 발급받으세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && !receipts.length ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="year">년도 선택</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {receiptYears.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">이벤트 선택</Label>
                <Select value={selectedSelection} onValueChange={setSelectedSelection}>
                  <SelectTrigger id="event">
                    <SelectValue placeholder="이벤트를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGroups.map(group => (
                      <SelectItem key={`group:${group._id}`} value={`group:${group._id}`}>
                        {group.name} (그룹)
                      </SelectItem>
                    ))}
                    {filteredEvents.map(event => (
                      <SelectItem key={`event:${event._id}`} value={`event:${event._id}`}>
                        {event.event_Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regNumber">등록번호</Label>
                <Input
                  id="regNumber"
                  placeholder="교회 등록번호 (예: 001-01)"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  placeholder="담당자 연락처"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSearch} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    검색 중...
                  </>
                ) : (
                  '영수증 조회'
                )}
              </Button>

              {receipts.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-xl font-semibold">조회 결과</h3>
                  {receipts.map((receipt) => (
                    <Card key={receipt._id}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">교회명</p>
                            <p className="font-medium">{receipt.churchName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">담당자</p>
                            <p className="font-medium">{receipt.managerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">참가 인원</p>
                            <p className="font-medium">{receipt.partTotal}명</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">금액</p>
                            <p className="font-medium">{receipt.costs.toLocaleString()}원</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Receipts;
