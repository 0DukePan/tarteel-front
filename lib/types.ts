
export interface ApiResponse <T = any>{
    success : boolean
    message ?: string
    data ?: T
    error ?: string
    errors ?: Record<string , string>
    pagination ?: PaginationInfo
}
export interface IClass {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    ageMin: number;
    ageMax: number;
    teacherId?: string;
    maxStudents: number;
    currentStudents: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

export interface IParent{
    id?: string ,
    fatherFirstName : string,
    fatherLastName : string,
    fatherPhone : string,
    fatherEmail : string,
    motherFirstName ?: string,
    motherLastName ?: string,
    motherPhone ?: string,
    motherEmail ?: string,
    createdAt ?: Date,
    updatedAt ?: Date
}

export interface ISudent {
    id?: string;
    parentId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    age: number;
    classId?: string;
    registrationStatus: 'pending' | 'approved' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
  }
  export interface ITeacher {
    id: string; // Changed from id?: string
    name: string;
    email: string;
    phone: string;
    specialization?: string;
    classCount: number; // Added
    createdAt?: Date;
    updatedAt?: Date;
  }
  export interface RegistrationRequest {
    parent: Omit<IParent, 'id' | 'createdAt' | 'updatedAt'>;
    student: Omit<ISudent, 'id' | 'createdAt' | 'updatedAt' | 'parentId' | 'age' | 'registrationStatus'>;
  }
//new

export interface RegistrationResponse {
  studentId: string;
  parentId: string;
}
export interface QueryOptions {
    page ?: number,
    limit ?: number,
    sort ?: string,
    search?: string,
    status ?: string,
    classId  ?: string
} 

export interface RegistrationWithDetails {
  student: {
    id: string;
    parentId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    classId: string | null;
    registrationStatus: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt: string;
  };
  parent: {
    id: string;
    fatherFirstName: string;
    fatherLastName: string;
    fatherPhone: string;
    fatherEmail: string;
    motherFirstName?: string | null;
    motherLastName?: string | null;
    motherPhone?: string | null;
    motherEmail?: string | null;
  };
  class?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    ageMin: number;
    ageMax: number;
    maxStudents: number;
    currentStudents: number;
  } | null;
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialization?: string | null;
  } | null;
}

export interface ClassWithDetails extends IClass {
  availableSpots: number;
  isFull: boolean;
  teacher?: ITeacher;
}

export interface AdminUser {
    id : string,
    username : string,
    email : string,
    role : string
    isActive : boolean
}

export interface LoginFromData {
    email : string,
    password : string
}

export interface LoginResponse {
    admin : AdminUser,
    token : string
}

export interface ClassFormData {
    name : string ,
    startTime : string,
    endTime : string,
    ageMin : number,
    ageMax : number,
    maxStudents : number
    teacherId ?: string
}
export interface TeacherFormData {
    name : string,
    email : string,
    phone : string,
    specialization ?: string
}


export interface PaginationInfo{
    page : number,
    limit : number,
    total : number,
    pages : number
}
export interface PaginatedData<T>{
    data : T[],
    pagination : PaginationInfo
}