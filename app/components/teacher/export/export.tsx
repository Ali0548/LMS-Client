'use client'
import React, { useEffect, useRef, useState } from 'react'
import FormFieldWithLabel from '../../../shared/components/FormFieldWithLabel/FormFieldWithLabel'
import { TextField } from '../../../shared/components/TextField/TextField'
import { useForm, Controller, SubmitHandler, } from 'react-hook-form'
import { ExportAnswers, Grade, Question, School, SubTopic, Subject, Topic } from '../../../shared/types'
import { Dropdown } from 'primereact/dropdown'
import { ErrorMessage } from '../../../shared/components/ErrorMessage/ErrorMessage'
import { useAppContext } from '../../../../layout/context/layoutcontext'
import fetchSchoolsHandler from '../../../context/server/school/fetchSchoolsHandler'
import { Button } from 'primereact/button'
import { InputSwitch } from 'primereact/inputswitch'
import { Toast } from 'primereact/toast'
import fetchGradeBySchoolIdHandler from '../../../context/server/grade/fetchGradeBySchoolIdHandler'
import fetchSubjectByGradeIdHandler from '../../../context/server/subject/fetchSubjectByGradeIdHandler'
import fetchTopicBySubjectIdHandler from '../../../context/server/topic/fetchTopicBySubjectIdHandler'
import fetchSubTopicBySubTopicIdHandler from '../../../context/server/subTopic/fetchSubTopicBySubTopicIdHandler'
import _, { set } from 'lodash'
import { Dialog } from 'primereact/dialog'
import QuestionList from './QuestionList'
import { TreeTableSelectionKeysType } from 'primereact/treetable'
import fetchQuestionsForExportHandler from '../../../context/server/export/fetchQuestionsForExportHandler'


const Export:React.FC = () => {
    const g = useAppContext();
    const toast = useRef<Toast>(null);
    const { control, handleSubmit, reset, setValue, formState: { errors: ExportErrors, isSubmitted, isValid, isDirty, isSubmitSuccessful, isSubmitting }, setError, clearErrors } = useForm<ExportAnswers>({
        mode: 'onBlur',
    });
    const [schools, setSchools] = useState<School[]>([] as School[]);
    const [grades, setGrades] = useState<Grade[]>([] as Grade[]);
    const [subjects, setSubjects] = useState<Subject[]>([] as Subject[]);
    const [topics, setTopics] = useState<Topic[]>([] as Topic[]);
    const [subTopics, setSubTopics] = useState<SubTopic[]>([] as SubTopic[]);
    const [MCQVisible, setMCQVisible] = useState<boolean>(false);
    const [shortQuestionVisible, setShortQuestionVisible] = useState<boolean>(false);
    const [longQuestionVisible, setLongQuestionVisible] = useState<boolean>(false);
    const [filteredMcqQuestions, setFilteredMcqQuestions] = useState<Question[]>([] as Question[])
    const [filteredShortQuestions, setFilteredShortQuestions] = useState<Question[]>([] as Question[])
    const [filteredLongQuestions, setFilteredLongQuestions] = useState<Question[]>([] as Question[])
    const [visible, setVisible] = useState<boolean>(false);
    const [selectedMqs, setSelectedMcq] = useState<TreeTableSelectionKeysType>({} as TreeTableSelectionKeysType);
    const [selectedShortQuestion, setSelectedShortQuestion] = useState<TreeTableSelectionKeysType>({} as TreeTableSelectionKeysType);
    const [selectedLongQuestion, setSelectedLongQuestion] = useState<TreeTableSelectionKeysType>({} as TreeTableSelectionKeysType);
    const [filterQuestionsLoading, setFilterQuestionsLoading] = useState<boolean>(false)
   
    const dificultyLevel = [
        { label: 'EASY', value: 'EASY' },
        { label: 'MEDIUM', value: 'MEDIUM' },
        { label: 'HARD', value: 'HARD' },
    ];
    const fetchSuggestQuestions = async (data: ExportAnswers) => {
        try {
            setFilterQuestionsLoading(true)
            const questions = await fetchQuestionsForExportHandler(data, "callback");
            if(questions?.status){
                setFilteredMcqQuestions(questions?.result?.data?.mcqQuestion as Question[])
                setFilteredShortQuestions(questions?.result?.data?.shortQuestion as Question[])
                setFilteredLongQuestions(questions?.result?.data?.longQuestion as Question[])
                setFilterQuestionsLoading(false);
            }
        } catch (error) {
            g?.setToaster({ severity: 'error', summary: 'Error', detail: "Something Went Wrong While Fetching Questions" });
        }
    }
    const submitForm: SubmitHandler<ExportAnswers> = async (ExportAnswers: ExportAnswers) => {
        try {
            if ((!(MCQVisible) && !(shortQuestionVisible) && !(longQuestionVisible))) {
                toast?.current?.show({ severity: "warn", summary: "Warning", detail: "Please select at least one type of question", life: 3000 });
                return;
            }
            setVisible(true);
            await fetchSuggestQuestions(ExportAnswers);
        }
        catch (error) {
            g?.setToaster({ severity: 'error', summary: 'Error', detail: "Something went wrong, Please try again later" })
        }
    }
    const fetchSchools = async () => {
        try {
            const response = await fetchSchoolsHandler();
            if (response?.status) {
                setSchools(response?.result?.data as School[]);
            }
        } catch (error) {
            g?.setToaster({ severity: 'error', summary: 'Error', detail: "Something Went Wrong While Fetching Schools" });
        }
    };

    const onSchoolChange = async (e:string, field:any) => {
        try {
            field?.onChange(e);
            const response = await fetchGradeBySchoolIdHandler(e as string);
            if (response?.status) {
                if(_?.isEmpty(response?.result?.data)){
                    setValue('gradeId', '');
                    setValue('subjectId', '');
                    setValue('topicId', '');
                    setValue('subTopicId', '');
                }
                setGrades(response?.result?.data as Grade[]);
            }
        } catch (error) {
            g?.setToaster({ severity: 'error', summary: 'Error', detail: "Something Went Wrong While Fetching Topics" });
        }
    }

    const onChangeGrade = async (e:string, field:any) => {
        try {
            field?.onChange(e);
            const response = await fetchSubjectByGradeIdHandler(e as string);
            if (response?.status) {
                if(_?.isEmpty(response?.result?.data)){
                    setValue('subjectId', '');
                    setValue('topicId', '');
                    setValue('subTopicId', '');
                }
                setSubjects(response?.result?.data as Subject[]);
            }
        } catch (error) {
            g?.setToaster({ severity: 'error', summary: 'Error', detail: "Something Went Wrong While Fetching SubTopics" });
        }
    }
    const onChangeSubject = async (e:string, field:any) => {
        try {
            field?.onChange(e);
            const response = await fetchTopicBySubjectIdHandler(e as  string);
            if (response?.status) {
                if(_?.isEmpty(response?.result?.data)){
                    setValue('topicId', '');
                    setValue('subTopicId', '');
                }
                setTopics(response?.result?.data as Topic[]);
            }
        } catch (error) {
            g?.setToaster({ severity: 'error', summary: 'Error', detail: "Something Went Wrong While Fetching SubTopics" });
        }
    }

    const onChangeTopic = async (e:string, field:any) => {
        try {
            field?.onChange(e);
            const response = await fetchSubTopicBySubTopicIdHandler(e as string);
            if (response?.status) {
                if(_?.isEmpty(response?.result?.data)){
                    setValue('subTopicId', '');
                }
                setSubTopics(response?.result?.data as SubTopic[]);
            }
        } catch (error) {
            g?.setToaster({ severity: 'error', summary: 'Error', detail: "Something Went Wrong While Fetching SubTopics" });
        }
    }

    useEffect(() => {
        fetchSchools();
        setValue('MCQVisible', MCQVisible);
        setValue('shortQuestionVisible', shortQuestionVisible);
        setValue('longQuestionVisible', longQuestionVisible);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        setValue('MCQVisible', MCQVisible);
        setValue('shortQuestionVisible', shortQuestionVisible);
        setValue('longQuestionVisible', longQuestionVisible);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [MCQVisible, shortQuestionVisible, longQuestionVisible]);
    return (
        <>
            <Toast ref={toast} />
            <Dialog visible={visible} maximizable style={{ width: '80vw' }} onHide={() => setVisible(false)}>
              <QuestionList setVisible={setVisible} filteredMcqQuestions={filteredMcqQuestions} filteredShortQuestions={filteredShortQuestions} filteredLongQuestions={filteredLongQuestions}  selectedMcq={selectedMqs} setSelectedMcq={setSelectedMcq} loading={filterQuestionsLoading}  selectedShortQuestion={selectedShortQuestion} setSelectedShortQuestion={setSelectedShortQuestion} selectedLongQuestion={selectedLongQuestion} setSelectedLongQuestion={setSelectedLongQuestion} />
            </Dialog>
            <h5>Export Answers</h5>
            <div className="card">
                <div className="grid p-fluid mt-3">
                    <div className="field col-12 md:col-3">
                        <Controller
                            name='schoolId'
                            control={control}
                            defaultValue=""
                            rules={{ required: "Select School" }}
                            render={({ field }) => (
                                <FormFieldWithLabel
                                    label="Select School"
                                    showCharLimit={false}
                                    showOptionalText={false}
                                    formField={
                                        <>
                                            <Dropdown
                                                value={field?.value}
                                                onChange={(e)=>{onSchoolChange(e?.value, field)}}
                                                options={schools}
                                                optionLabel="type"
                                                optionValue="id"
                                                placeholder="Select a School"
                                                filter
                                                className={`w-100 ${ExportErrors?.schoolId?.message ? "p-invalid" : ""}`}
                                            />
                                            <ErrorMessage text={ExportErrors?.schoolId?.message} />
                                        </>
                                    }
                                />
                            )}
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <Controller
                            name='gradeId'
                            control={control}
                            defaultValue=""
                            rules={{ required: "Select Grade" }}
                            render={({ field }) => (
                                <FormFieldWithLabel
                                    label="Select Grade"
                                    showCharLimit={false}
                                    showOptionalText={false}
                                    formField={
                                        <>
                                            <Dropdown
                                                value={field?.value}
                                                onChange={(e)=>{onChangeGrade(e?.value, field)}}
                                                options={grades}
                                                optionLabel="grade"
                                                optionValue="id"
                                                placeholder="Select a Grade"
                                                filter
                                                className={`w-100 ${ExportErrors?.gradeId?.message ? "p-invalid" : ""}`}
                                            />
                                            <ErrorMessage text={ExportErrors?.gradeId?.message} />
                                        </>
                                    }
                                />
                            )}
                        />

                    </div>
                    <div className="field col-12 md:col-3">
                        <Controller
                            name='subjectId'
                            control={control}
                            defaultValue=""
                            rules={{ required: "Select Subject" }}
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select Subject"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <Dropdown
                                                value={field?.value}
                                                onChange={(e)=>onChangeSubject(e?.value,field)}
                                                options={subjects}
                                                optionLabel="subject"
                                                optionValue="id"
                                                placeholder="Select a Subject"
                                                filter
                                                className={`w-100 ${ExportErrors?.subjectId?.message ? "p-invalid" : ""}`}
                                            />
                                        }
                                    />
                                    <ErrorMessage text={ExportErrors?.subjectId?.message} />
                                </>
                            )}
                        />

                    </div>
                    <div className="field col-12 md:col-3">
                        <Controller
                            name='topicId'
                            control={control}
                            defaultValue=""
                            rules={{ required: "Select Topic" }}
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select Topic"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <Dropdown
                                                value={field?.value}
                                                onChange={(e)=>onChangeTopic(e?.value,field)}
                                                options={topics}
                                                optionLabel="topic"
                                                optionValue="id"
                                                placeholder="Select a Topic"
                                                filter
                                                className={`w-100 ${ExportErrors?.topicId?.message ? "p-invalid" : ""}`}
                                            />
                                        }
                                    />
                                    <ErrorMessage text={ExportErrors?.topicId?.message} />
                                </>
                            )}
                        />
                    </div>
                    <div className="field col-16 md:col-12">
                        <Controller
                            name='subTopicId'
                            control={control}
                            rules={{ required: "Select Sub Topic" }}
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select Sub Topic"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <Dropdown
                                                value={field?.value}
                                                onChange={field?.onChange}
                                                options={subTopics}
                                                optionLabel="subTopic"
                                                optionValue="id"
                                                placeholder="Select Sub Topic"
                                                filter
                                                className={`w-100 ${ExportErrors?.subTopicId?.message ? "p-invalid" : ""}`}
                                            />
                                        }
                                    />
                                    <ErrorMessage text={ExportErrors?.subTopicId?.message} />
                                </>
                            )}
                        />
                    </div>
                    <div className="field col-16 md:col-3">
                        <div className='flex align-items-center'>
                            <label htmlFor="" className='mr-3 font-bold'> {`Use MCQ's`}</label>
                            <InputSwitch checked={MCQVisible} onChange={(e) => setMCQVisible(!MCQVisible)} />
                        </div>
                    </div>
                    <div className="field col-16 md:col-3">
                        <div className='flex align-items-center'>
                            <label htmlFor="" className='mr-3 font-bold'> {`Use Short Question`}</label>
                            <InputSwitch checked={shortQuestionVisible} onChange={(e) => setShortQuestionVisible(!shortQuestionVisible)} />
                        </div>
                    </div>
                    <div className="field col-16 md:col-3">
                        <div className='flex align-items-center'>
                            <label htmlFor="" className='mr-3 font-bold'> {`Use Long Answer`}</label>
                            <InputSwitch checked={longQuestionVisible} onChange={(e) => setLongQuestionVisible(!longQuestionVisible)} />
                        </div>
                    </div>
                </div>
                {MCQVisible && <div className="grid p-fluid mt-4">
                    <div className="field col-12 md:col-4">
                        <Controller
                            name='mcqQuestionQuantity'
                            control={control}
                            rules={MCQVisible ? {
                                required: "Select MCQ's Quantity",
                                validate: {
                                    minValue: value => (value >= 5) || "Minimum MCQ's Quantity Should be 5",
                                    maxValue: value => (value <= 15) || "Maximum MCQ's Quantity Should be 15"
                                }
                            } : {}

                            }
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select MCQ's Quantity"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <TextField type='number' placeholder="eg. 10" errorMessage={ExportErrors?.mcqQuestionQuantity?.message} value={String(field?.value)} onChange={field.onChange} />} />
                                </>
                            )}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <Controller
                            name='mcqDifficultyLevel'
                            control={control}
                            rules={{ required: "Select MCQ's Dificulty Level" }}
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select Dificulty Level"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <Dropdown
                                                value={field?.value}
                                                onChange={field?.onChange}
                                                options={dificultyLevel}
                                                optionLabel="label"
                                                optionValue="value"
                                                placeholder="Select Dificulty Level"
                                                filter
                                                className={`w-100 ${ExportErrors?.mcqDifficultyLevel?.message ? "p-invalid" : ""}`}
                                            />
                                        }
                                    />
                                    <ErrorMessage text={ExportErrors?.mcqDifficultyLevel?.message} />
                                </>
                            )}
                        />
                    </div>
                </div>}
                {shortQuestionVisible && <div className="grid p-fluid mt-4">
                    <div className="field col-12 md:col-4">
                        <Controller
                            name='shortQuestionQuantity'
                            control={control}
                            rules={shortQuestionVisible ? {
                                required: "Select Short Quantity",
                                validate: {
                                    minValue: value => (value >= 5) || "Minimum Short Quantity Should be 5",
                                    maxValue: value => (value <= 15) || "Maximum Short Quantity Should be 15"
                                }
                            } : {}

                            }
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select Short Quantity"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <TextField type='number' placeholder="eg. 10" errorMessage={ExportErrors?.shortQuestionQuantity?.message} value={String(field?.value)} onChange={field.onChange} />} />
                                </>
                            )}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <Controller
                            name='shortQuestionDifficultyLevel'
                            control={control}
                            rules={{ required: "Select Short Question Dificulty Level" }}
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select Dificulty Level"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <Dropdown
                                                value={field?.value}
                                                onChange={field?.onChange}
                                                options={dificultyLevel}
                                                optionLabel="label"
                                                optionValue="value"
                                                placeholder="Select Dificulty Level"
                                                filter
                                                className={`w-100 ${ExportErrors?.shortQuestionDifficultyLevel?.message ? "p-invalid" : ""}`}
                                            />
                                        }
                                    />
                                    <ErrorMessage text={ExportErrors?.shortQuestionDifficultyLevel?.message} />
                                </>
                            )}
                        />
                    </div>
                </div>}

                {longQuestionVisible && <div className="grid p-fluid mt-4">
                    <div className="field col-12 md:col-4">
                        <Controller
                            name='longQuestionQuantity'
                            control={control}
                            rules={longQuestionVisible ? {
                                required: "Select Long Questions Quantity",
                                validate: {
                                    minValue: value => (value >= 2) || "Minimum Long Quantity Should be 2",
                                    maxValue: value => (value <= 5) || "Maximum Long Quantity Should be 5"
                                }
                            } : {}}
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select Long Question Quantity"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <TextField type='number' placeholder="eg. 10" errorMessage={ExportErrors?.longQuestionQuantity?.message} value={String(field?.value)} onChange={field.onChange} />} />
                                </>
                            )}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <Controller
                            name='longQuestionDifficultyLevel'
                            control={control}
                            rules={{ required: "Select Long Question Dificulty Level" }}
                            render={({ field }) => (
                                <>
                                    <FormFieldWithLabel
                                        label="Select Dificulty Level"
                                        showCharLimit={false}
                                        showOptionalText={false}
                                        formField={
                                            <Dropdown
                                                value={field?.value}
                                                onChange={field?.onChange}
                                                options={dificultyLevel}
                                                optionLabel="label"
                                                optionValue="value"
                                                placeholder="Select Dificulty Level"
                                                filter
                                                className={`w-100 ${ExportErrors?.longQuestionDifficultyLevel?.message ? "p-invalid" : ""}`}
                                            />
                                        }
                                    />
                                    <ErrorMessage text={ExportErrors?.longQuestionDifficultyLevel?.message} />
                                </>
                            )}
                        />
                    </div>
                </div>}
                <div className="gap-2">
                    <Button label={`Apply`} onClick={handleSubmit(submitForm)} icon="pi pi-check" />
                </div>
            </div>
        </>
    )
}

export default Export