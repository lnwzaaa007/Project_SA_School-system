import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Space, message, Spin, InputNumber } from 'antd';
import { SearchOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import SelectGrade from '../../../components/SelectGrade';
import SelectClass from '../../../components/SelectClass';
import { educationRecordsAPI, courseAPI, teacherAPI, termAPI } from '../../../services/https';
import type { EducationRecordInterface, CreateEducationRecordPayload, UpdateEducationRecordPayload } from '../../../interfaces/EducationRecord';

interface StudentRecord extends EducationRecordInterface {
  key: number;
  no: number;
  student_name?: string;
  student_id_display?: string;
}

interface Course {
  id: number;
  course_name: string;
  course_code?: string;
}

interface Teacher {
  id: number;
  t_first_name: string;
  t_last_name: string;
  teacher_id?: string;
}

interface Term {
  id: number;
  academic_year: number;
  semester: number;
}

const EnterScore = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  
  // Options for dropdowns
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    course_id: undefined as number | undefined,
    teacher_id: undefined as number | undefined,
    term_id: undefined as number | undefined,
    grade_year: null as number | null,
    grade_class: null as number | null,
  });

  // Fetch dropdown options on component mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      // Fetch courses
      const coursesRes = await courseAPI.getCourseAll();
      if (coursesRes.data) {
        setCourses(coursesRes.data);
      }

      // Fetch teachers
      const teachersRes = await teacherAPI.getNameTeacherAll();
      if (teachersRes.data) {
        setTeachers(teachersRes.data);
      }

      // Fetch terms
      const termsRes = await termAPI.getTermsAll();
      if (termsRes.data) {
        setTerms(termsRes.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลเริ่มต้น');
    }
  };

  // Fetch education records from API or create dummy students for testing
  const fetchRecords = async () => {
    if (!filters.course_id || !filters.term_id) {
      message.warning('กรุณาเลือกวิชาและภาคเรียนก่อน');
      return;
    }

    setLoading(true);
    try {
      // First try to get existing education records
      const response = await educationRecordsAPI.list({
        course_id: filters.course_id,
        term_id: filters.term_id,
        teacher_id: filters.teacher_id,
      });
      
      let studentRecords: StudentRecord[] = [];
      
      if (response.data?.data && response.data.data.length > 0) {
        // Use existing education records
        studentRecords = response.data.data.map((record: EducationRecordInterface, index: number) => ({
          ...record,
          key: record.id || index,
          no: index + 1,
          student_name: `นักเรียน ${record.student_id}`,
          student_id_display: `S${String(record.student_id).padStart(6, '0')}`,
        }));
      } else {
        // Create dummy students for testing if no records exist
        // This simulates students enrolled in the selected course/grade/class
        const dummyStudents = Array.from({ length: 10 }, (_, index) => ({
          key: index,
          no: index + 1,
          id: undefined, // No existing education record
          term_id: filters.term_id!,
          course_id: filters.course_id!,
          teacher_id: filters.teacher_id || 1,
          student_id: 660001 + index, // Sequential student IDs
          student_name: `นักเรียน ${660001 + index}`,
          student_id_display: `S${String(660001 + index).padStart(6, '0')}`,
          point: 0,
          mid_point: 0,
          final_point: 0,
          grade_point: 0,
          behavior_point: 0,
        }));
        
        studentRecords = dummyStudents;
      }
      
      setRecords(studentRecords);
      
      if (studentRecords.length === 0) {
        message.info('ไม่พบนักเรียนในรายวิชานี้');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving records
  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = records.map(async (record) => {
        if (record.id) {
          // Update existing record
          const updatePayload: UpdateEducationRecordPayload = {
            point: record.point,
            mid_point: record.mid_point,
            final_point: record.final_point,
            grade_point: record.grade_point,
            behavior_point: record.behavior_point,
          };
          return educationRecordsAPI.update(record.id, updatePayload);
        } else {
          // Create new record
          const createPayload: CreateEducationRecordPayload = {
            term_id: record.term_id,
            course_id: record.course_id,
            teacher_id: record.teacher_id,
            student_id: record.student_id,
            point: record.point,
            mid_point: record.mid_point,
            final_point: record.final_point,
            grade_point: record.grade_point,
            behavior_point: record.behavior_point,
          };
          return educationRecordsAPI.create(createPayload);
        }
      });

      await Promise.all(promises);
      message.success('บันทึกข้อมูลสำเร็จ');
      fetchRecords(); // Refresh data
    } catch (error) {
      console.error('Error saving records:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (key: number, field: string, value: any) => {
    setRecords(prev => 
      prev.map(record => 
        record.key === key 
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  // Calculate total and grade
  const calculateTotalAndGrade = (record: StudentRecord) => {
    const collect = record.point || 0;
    const behavior = record.behavior_point || 0;
    const midterm = record.mid_point || 0;
    const final = record.final_point || 0;
    
    const total = collect + behavior + midterm + final;
    
    let grade = 'F';
    if (total >= 80) grade = 'A';
    else if (total >= 75) grade = 'B+';
    else if (total >= 70) grade = 'B';
    else if (total >= 65) grade = 'C+';
    else if (total >= 60) grade = 'C';
    else if (total >= 55) grade = 'D+';
    else if (total >= 50) grade = 'D';
    
    return { total, grade };
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ที่',
      dataIndex: 'no',
      width: 50,
      align: 'center' as const,
      render: (_: any, record: StudentRecord) => record.no,
    },
    {
      title: 'รหัส',
      dataIndex: 'student_id_display',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: StudentRecord) => (
        <Input size="small" value={record.student_id_display} disabled />
      ),
    },
    {
      title: 'ชื่อ - นามสกุล',
      dataIndex: 'student_name',
      width: 200,
      render: (_: any, record: StudentRecord) => (
        <Input size="small" value={record.student_name} disabled />
      ),
    },
    {
      title: 'คะแนนเก็บ',
      dataIndex: 'point',
      width: 100,
      render: (_: any, record: StudentRecord) => (
        <InputNumber
          size="small"
          min={0}
          max={100}
          value={record.point}
          onChange={(value) => handleInputChange(record.key, 'point', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'จิตพิสัย',
      dataIndex: 'behavior_point',
      width: 100,
      render: (_: any, record: StudentRecord) => (
        <InputNumber
          size="small"
          min={0}
          max={100}
          value={record.behavior_point}
          onChange={(value) => handleInputChange(record.key, 'behavior_point', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'คะแนนกลางภาค',
      dataIndex: 'mid_point',
      width: 130,
      render: (_: any, record: StudentRecord) => (
        <InputNumber
          size="small"
          min={0}
          max={100}
          value={record.mid_point}
          onChange={(value) => handleInputChange(record.key, 'mid_point', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'คะแนนปลายภาค',
      dataIndex: 'final_point',
      width: 130,
      render: (_: any, record: StudentRecord) => (
        <InputNumber
          size="small"
          min={0}
          max={100}
          value={record.final_point}
          onChange={(value) => handleInputChange(record.key, 'final_point', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'รวมคะแนน 100',
      dataIndex: 'total',
      width: 130,
      render: (_: any, record: StudentRecord) => {
        const { total } = calculateTotalAndGrade(record);
        return <Input size="small" value={total} disabled />;
      },
    },
    {
      title: 'เกรด',
      dataIndex: 'grade',
      width: 100,
      render: (_: any, record: StudentRecord) => {
        const { grade } = calculateTotalAndGrade(record);
        return <Input size="small" value={grade} disabled />;
      },
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          placeholder="วิชา"
          style={{ width: 200 }}
          value={filters.course_id}
          onChange={(value) => setFilters(prev => ({ ...prev, course_id: value }))}
        >
          {/* Add course options here - you may need to fetch from courses API */}
        </Select>
        
        <Select
          placeholder="อาจารย์ผู้สอน"
          style={{ width: 200 }}
          value={filters.teacher_id}
          onChange={(value) => setFilters(prev => ({ ...prev, teacher_id: value }))}
        >
          {/* Add teacher options here - you may need to fetch from teachers API */}
        </Select>
        
        <SelectGrade 
          value={filters.grade_year}
          onChange={(value) => setFilters(prev => ({ ...prev, grade_year: value }))}
        />
        
        <SelectClass 
          value={filters.grade_class}
          onChange={(value) => setFilters(prev => ({ ...prev, grade_class: value }))}
        />
        
        <Button 
          icon={<SearchOutlined />} 
          onClick={fetchRecords}
          loading={loading}
        />
        
        <div style={{ marginLeft: 'auto' }}>
          <Button icon={<EditOutlined />} style={{ marginRight: 8 }} />
          <Button 
            type="primary" 
            onClick={handleSave}
            loading={saving}
          >
            บันทึก
          </Button>
        </div>
      </div>
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={records}
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Spin>
    </div>
  );
};
export default EnterScore;