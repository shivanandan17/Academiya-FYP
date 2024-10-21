export const isTeacher = (userId?: string | null) => {
    return userId === process.env.NEXT_PUBLIC_TEACHER_ID_1 || userId === process.env.NEXT_PUBLIC_TEACHER_ID_2;
};
