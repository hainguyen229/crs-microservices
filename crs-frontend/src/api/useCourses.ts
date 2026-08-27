import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { getCourses } from './courseApi';
import type { Course } from '../types/course';
import type { ApiErrorResponse } from '../types/apiError';

export type LoadState =
  | 'loading'
  | 'success'
  | 'empty'
  | 'error';

export function useCourses(
  keyword: string,
  page: number,
  size = 10
) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [state, setState] =
    useState<LoadState>('loading');

  const [errorMessage, setErrorMessage] =
    useState('');

  const fetchCourses = useCallback(async () => {
    setState('loading');
    setErrorMessage('');

    try {
      const res = await getCourses(
        keyword,
        page,
        size
      );

      const data = res.data;

      setCourses(data.content);
      setTotalPages(data.totalPages);

      if (data.content.length === 0) {
        setState('empty');
      } else {
        setState('success');
      }
    } catch (err) {
      let message =
        'Da xay ra loi khong xac dinh, vui long thu lai.';

      if (
        axios.isAxiosError<ApiErrorResponse>(err)
      ) {
        if (err.response?.data?.message) {
          message =
            err.response.data.message;
        } else if (!err.response) {
          message =
            'Khong ket noi duoc toi he thong. Vui long thu lai sau.';
        }
      }

      setCourses([]);
      setErrorMessage(message);
      setState('error');
    }
  }, [keyword, page, size]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    totalPages,
    state,
    errorMessage,
    refetch: fetchCourses,
  };
}