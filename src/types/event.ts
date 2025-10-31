export interface EventFormData {
  event_ID?: number;
  event_Name: string;
  event_Location: string;
  event_Year: number;
  event_Start_Date: string;
  event_End_Date: string;
  event_Registration_Start_Date: string;
  event_Registration_End_Date: string;
  event_Open_Available: '공개' | '비공개';
  event_Place: string;
  event_Month: number;
  event_Link?: string;
  event_Registration_Start_Time?: string;
  event_Registration_End_Time?: string;
  created_At?: Date;
  updated_At?: Date;
}

export interface SampleEvent {
  sampleEvent_ID: number;
  sampleEvent_Name: string;
  sampleEvent_Location: string;
  sampleEvent_Year: string;
  sampleEvent_Start_Date: string | null;
  sampleEvent_End_Date: string | null;
  sampleEvent_Registration_Start_Date: string | null;
  sampleEvent_Registration_End_Date: string | null;
  sampleEvent_Open_Available: '공개' | '비공개';
  sampleEvent_Place: string;
  sampleEvent_Month: string;
}

export interface IEventCreate {
  event_Name: string;
  event_Description?: string;
  event_Location: string;
  event_Year: number;
  event_Start_Date: string;
  event_End_Date: string;
  event_Registration_Start_Date: string;
  event_Registration_End_Date: string;
  event_Open_Available: '공개' | '비공개';
  event_Place: string;
  event_Month: number;
  event_Registration_Start_Time?: string;
  event_Registration_End_Time?: string;
}

export interface IEvent extends IEventCreate {
  _id: string;
  createdAt: string;
  updatedAt: string;
  event_Link?: string;
}

export interface IEventGroup {
  _id: string;
  name: string;
  location?: string;
  eventIds: string[];
  createdAt: string;
  updatedAt: string;
}
