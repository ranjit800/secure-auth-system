export interface User {
    email: string;
    isEmailVerified: boolean;
}

export interface Session {
    sessionId: string;
    deviceInfo: {
        browser: string;
        os: string;
        platform: string;
        type: string;
    };
    ipAddress: string;
    isActive: boolean;
    lastActive: string;
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        email: string;
        isEmailVerified: boolean;
        verificationToken?: string;
        verificationUrl?: string;
    };
}

export interface DashboardResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
    };
}

export interface SessionsResponse {
    success: boolean;
    data: {
        sessions: Session[];
        totalSessions: number;
        currentSessionId: string;
    };
}
