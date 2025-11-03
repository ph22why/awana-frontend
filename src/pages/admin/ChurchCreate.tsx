import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { churchSchema, ChurchFormData } from '@/schemas/church';
import { useCreateChurch } from '@/hooks/useChurch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

const ChurchCreate = () => {
  const navigate = useNavigate();
  const createChurchMutation = useCreateChurch();

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: '',
      location: '',
      mainId: '',
      subId: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = (data: ChurchFormData) => {
    createChurchMutation.mutate(data as any, {
      onSuccess: () => {
        navigate('/admin/churches/manage');
      },
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/churches/manage')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">새 교회 등록</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>교회 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>교회명 *</FormLabel>
                    <FormControl>
                      <Input placeholder="교회 이름" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주소 *</FormLabel>
                    <FormControl>
                      <Input placeholder="교회 주소" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mainId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="0000" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="00" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연락처</FormLabel>
                      <FormControl>
                        <Input placeholder="010-0000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/churches/manage')}>
                  취소
                </Button>
                <Button type="submit" disabled={createChurchMutation.isPending}>
                  {createChurchMutation.isPending ? '등록 중...' : '등록'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChurchCreate;
