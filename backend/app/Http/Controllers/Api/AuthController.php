<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password_hash)) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * POST /api/auth/google
     * Login atau register otomatis menggunakan akun Google.
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'google_id' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string', 'max:500'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            $name = !empty($validated['name']) ? $validated['name'] : explode('@', $validated['email'])[0];
            $user = User::create([
                'name' => $name,
                'email' => $validated['email'],
                'password_hash' => Hash::make(\Illuminate\Support\Str::random(32)),
            ]);
        }

        // Pastikan user memiliki minimal 1 bisnis agar bisa langsung akses dashboard
        $business = $user->businesses()->first();
        if (!$business) {
            $business = $user->businesses()->create([
                'name' => ($user->name ?? 'Nexora') . ' Store',
                'category' => 'Retail',
                'address' => 'Indonesia',
            ]);
        }

        $token = $user->createToken('google-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login Google berhasil.',
            'data' => [
                'user' => $user,
                'business_id' => $business->id,
                'token' => $token,
            ],
        ]);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}