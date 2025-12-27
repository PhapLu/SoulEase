import { router } from "expo-router";
import React, { createContext, useContext, useState, ReactNode } from "react";

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface User {
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, name: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 2. MOCK DATABASE (Giả lập Server) ---
// Mặc định có sẵn 1 user 
// fetch('https://api.your-backend.com/login')
const MOCK_DB = [
    { email: "john.carter@gmail.com", password: "123", name: "John Carter" }
];

// --- 3. HELPER VALIDATION (Quy tắc mật khẩu & Email) ---
export const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
};

export const validatePasswordRules = (password: string) => {
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    // Bạn có thể mở rộng thêm rule:
    // if (!/[A-Z]/.test(password)) return "Phải có 1 chữ hoa";
    // if (!/[0-9]/.test(password)) return "Phải có 1 số";
    return null; // Null nghĩa là hợp lệ
};

// --- 4. PROVIDER ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- LOGIC ĐĂNG NHẬP ---
    const signIn = async (email: string, pass: string) => {
        setIsLoading(true);
        // Giả lập độ trễ mạng (API call)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const foundUser = MOCK_DB.find(u => u.email === email && u.password === pass);

        if (foundUser) {
            setUser({ email: foundUser.email, name: foundUser.name });
            setIsLoading(false);
            return { success: true };
        } else {
            setIsLoading(false);
            // Kiểm tra xem sai email hay sai pass để báo lỗi chính xác (Logic BE)
            const emailExists = MOCK_DB.some(u => u.email === email);
            if (!emailExists) return { success: false, error: "Email không tồn tại" };
            return { success: false, error: "Mật khẩu không chính xác" };
        }
    };

    // --- LOGIC ĐĂNG KÝ ---
    const signUp = async (email: string, name: string, pass: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 1. Check email tồn tại chưa
        const exists = MOCK_DB.some(u => u.email === email);
        if (exists) {
            setIsLoading(false);
            return { success: false, error: "Email này đã được sử dụng" };
        }

        // 2. Tạo user mới (Push vào Mock DB)
        const newUser = { email, password: pass, name };
        MOCK_DB.push(newUser);
        return { success: true };
    };

    const signOut = () => {
        setUser(null);
        router.replace("/(auth)/Login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để dùng nhanh
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};