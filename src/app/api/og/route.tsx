import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Dynamic OG Image Generator
 * Usage: /api/og?title=活動標題&subtitle=副標題&date=2025-01-01
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Party Aggregator';
    const subtitle = searchParams.get('subtitle') || '發現精彩活動';
    const date = searchParams.get('date');
    const image = searchParams.get('image');
    const type = searchParams.get('type') || 'event'; // event, club, vendor

    const bgColors: Record<string, string[]> = {
        event: ['#000000', '#1a1a2e'],
        club: ['#1a1a2e', '#16213e'],
        vendor: ['#16213e', '#0f3460'],
    };

    const [color1, color2] = bgColors[type] || bgColors.event;

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
                    padding: '60px',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                {/* Decorative circles */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        right: '-100px',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-50px',
                        left: '-50px',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.03)',
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        maxWidth: '80%',
                    }}
                >
                    {date && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.1)',
                                padding: '10px 20px',
                                borderRadius: '100px',
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '24px',
                            }}
                        >
                            📅 {date}
                        </div>
                    )}

                    <div
                        style={{
                            fontSize: '72px',
                            fontWeight: 900,
                            color: 'white',
                            lineHeight: 1.1,
                            letterSpacing: '-2px',
                            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
                        }}
                    >
                        {title.length > 40 ? title.substring(0, 40) + '...' : title}
                    </div>

                    <div
                        style={{
                            fontSize: '32px',
                            color: 'rgba(255,255,255,0.7)',
                            fontWeight: 500,
                        }}
                    >
                        {subtitle.length > 60 ? subtitle.substring(0, 60) + '...' : subtitle}
                    </div>
                </div>

                {/* Logo/Brand */}
                <div
                    style={{
                        position: 'absolute',
                        top: '60px',
                        left: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            background: 'white',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                        }}
                    >
                        🎉
                    </div>
                    <div
                        style={{
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: 700,
                        }}
                    >
                        Party
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
