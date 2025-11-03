import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, EventFormData } from '@/schemas/event';
import { useEvent, useUpdateEvent } from '@/hooks/useEvent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const EventEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id!);
  const updateEventMutation = useUpdateEvent();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event_Name: '',
      event_Place: '',
      event_Location: '',
      event_Year: new Date().getFullYear(),
      event_Registration_Start_Time: '09:00',
      event_Registration_End_Time: '18:00',
      event_Open_Available: '공개',
      event_Link: '',
      event_Description: '',
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        event_Name: event.event_Name,
        event_Place: event.event_Place,
        event_Location: event.event_Location,
        event_Year: event.event_Year,
        event_Start_Date: new Date(event.event_Start_Date),
        event_End_Date: new Date(event.event_End_Date),
        event_Registration_Start_Date: new Date(event.event_Registration_Start_Date),
        event_Registration_End_Date: new Date(event.event_Registration_End_Date),
        event_Registration_Start_Time: event.event_Registration_Start_Time,
        event_Registration_End_Time: event.event_Registration_End_Time,
        event_Open_Available: event.event_Open_Available as '공개' | '비공개',
        event_Link: event.event_Link || '',
        event_Description: event.event_Description || '',
      });
    }
  }, [event, form]);

  const onSubmit = (data: EventFormData) => {
    const formattedData = {
      ...data,
      event_Start_Date: data.event_Start_Date.toISOString(),
      event_End_Date: data.event_End_Date.toISOString(),
      event_Registration_Start_Date: data.event_Registration_Start_Date.toISOString(),
      event_Registration_End_Date: data.event_Registration_End_Date.toISOString(),
    };

    updateEventMutation.mutate(
      { id: id!, data: formattedData as any },
      {
        onSuccess: () => {
          navigate('/admin/events/manage');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/events/manage')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">이벤트 수정</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>이벤트 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="event_Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이벤트명 *</FormLabel>
                      <FormControl>
                        <Input placeholder="이벤트 이름" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_Year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>년도 *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_Place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>장소 *</FormLabel>
                      <FormControl>
                        <Input placeholder="장소명" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_Location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주소 *</FormLabel>
                      <FormControl>
                        <Input placeholder="상세 주소" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="event_Start_Date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>행사 시작일 *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>날짜 선택</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn('p-3 pointer-events-auto')}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_End_Date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>행사 종료일 *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>날짜 선택</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn('p-3 pointer-events-auto')}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="event_Registration_Start_Date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>접수 시작일 *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>날짜 선택</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn('p-3 pointer-events-auto')}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_Registration_Start_Time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>접수 시작 시간 *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="event_Registration_End_Date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>접수 종료일 *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>날짜 선택</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn('p-3 pointer-events-auto')}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_Registration_End_Time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>접수 종료 시간 *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="event_Open_Available"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>공개 여부 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="공개">공개</SelectItem>
                          <SelectItem value="비공개">비공개</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_Link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>접수 링크</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="event_Description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Textarea placeholder="이벤트 설명" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/events/manage')}>
                  취소
                </Button>
                <Button type="submit" disabled={updateEventMutation.isPending}>
                  {updateEventMutation.isPending ? '수정 중...' : '수정'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventEdit;
