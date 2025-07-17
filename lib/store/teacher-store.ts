import {create} from 'zustand'
import { apiClient } from '@/lib/api'
import type { AdminUser, ITeacher, TeacherFormData } from '@/lib/types'

interface TeacherState {
    teachers : ITeacher[],
    loading : boolean,
    error : string | null
    fetchTeachers : () => Promise<void>
    getTeacherById : (teacherId : string) => Promise<ITeacher | null>
    createTeacher : (data : TeacherFormData) => Promise<void>
    updateTeacher : (teacherId : string , data : Partial<TeacherFormData>) => Promise<void>
    deleteTeacher : (teacherId : string) => Promise<void>
}

export const useTeacherStore = create<TeacherState>((set , get) => ({
    teachers : [],
    loading : false,
    error : null,

    fetchTeachers : async () => {
        set({ loading: true, error: null })
        try {
            const teachers = await apiClient.getTeachers()
            set({ teachers, loading: false }) 
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch teachers',
                loading: false
            })
        }
    },
    

    getTeacherById : async (teacherId : string) => {
        try {
            const teacher = await apiClient.getTeacherById(teacherId)
            return teacher
        } catch (error) {
            set({
                error : error instanceof Error ? error.message : 'Failed to fetch teacher'
            })
            return null
        }
    },

    createTeacher : async (data : TeacherFormData) => {
        set({loading : true , error : null})
        try {
            await apiClient.createTeacher(data)
            set({loading : false})
        } catch (error) {
            set({
                error : error instanceof Error ? error.message : 'Failed to create teacher',
                loading : false
            })
            throw error
        }
    },

    updateTeacher : async (teacherId : string , data : Partial<TeacherFormData>) => {
        set({loading : true , error : null})
        try {
            await apiClient.updateTeacher(teacherId , data)
            set({loading : false})
        } catch (error) {
            set({
                error : error instanceof Error ? error.message : 'Failed to update teacher',
                loading : false
            })
            throw error 
        }
    },

    deleteTeacher : async (teacherId : string) => {
        set({loading : true , error : null})
        try {
            await apiClient.deleteTeacher(teacherId)
            set({loading : false})
        } catch (error) {
            set({
                error : error instanceof Error ? error.message : 'Failed to delete teacher',
                loading : false
            })
            throw error
        }
    }


}))