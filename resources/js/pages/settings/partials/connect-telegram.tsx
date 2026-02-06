import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react'; // Pastikan install lucide-react jika belum
import axios from 'axios';

export default function ConnectTelegram({ className }: { className?: string }) {
    const user = usePage().props.auth.user; // Ambil data user yang sedang login
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateCode = async () => {
        try {
            setIsLoading(true);
            // Panggil endpoint backend untuk generate kode unik
            const response = await axios.post('/settings/telegram/generate-code');
            setGeneratedCode(response.data.code);
            
            // Redirect user ke Bot Telegram dengan membawa kode tersebut
            // Bot URL sekarang dinamis dari backend
            const botUrl = response.data.bot_url || `https://t.me/${response.data.bot_username}`;
            window.open(`${botUrl}?start=${response.data.code}`, '_blank');
        } catch (error) {
            console.error('Failed to generate Telegram code:', error);
            alert('Gagal membuat koneksi. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={className}>
            <Card>
                <CardHeader>
                    <CardTitle>Telegram Integration</CardTitle>
                    <CardDescription>
                        Hubungkan akun Anda dengan Telegram untuk mengecek jadwal dan tugas secara instan via chat.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {user.telegram_chat_id ? (
                        <div className="flex items-center gap-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            <div className="p-2 bg-green-100 rounded-full">
                                <Send className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold">Terhubung dengan Telegram</p>
                                <p className="text-sm opacity-90">ID: {user.telegram_chat_id}</p>
                            </div>
                            <Button variant="outline" className="ml-auto text-red-600 border-red-200 hover:bg-red-50">
                                Putuskan
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Klik tombol di bawah untuk membuka Telegram dan tekan tombol <strong>START</strong> pada bot kami.
                            </p>
                            
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={generateCode} 
                                    disabled={isLoading}
                                    className="bg-[#229ED9] hover:bg-[#1f8bc] text-white"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isLoading ? 'Menghubungkan...' : 'Hubungkan Telegram'}
                                </Button>
                                
                                {generatedCode && (
                                    <span className="text-xs text-muted-foreground animate-pulse">
                                        Menunggu konfirmasi dari Telegram...
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}