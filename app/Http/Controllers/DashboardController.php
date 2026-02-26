<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GoogleAnalyticsService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller 
{
    protected $analyticsService;

    public function __construct(GoogleAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index()
    {
        Log::info('DashboardController@index: Fetching analytics data');

        try {
            // Test connection first
            $connectionTest = $this->analyticsService->testConnection();
            Log::info('GA4 Connection test', $connectionTest);

            if (!$connectionTest['success']) {
                throw new \Exception($connectionTest['message']);
            }

            // Fetch visitors and page views for last 7 days
            $visitorsData = $this->analyticsService->getTotalVisitorsAndPageViews(7);
            Log::info('Fetched visitors data', ['data_count' => count($visitorsData)]);

            // Calculate totals for 7 days
            $totalVisitors = 0;
            $totalPageviews = 0;
            
            foreach ($visitorsData as $day) {
                $totalVisitors += $day['visitors'] ?? 0;
                $totalPageviews += $day['pageViews'] ?? 0;
            }

            // Fetch most visited pages
            $mostVisitedPages = $this->analyticsService->getMostVisitedPages(30);
            Log::info('Fetched most visited pages', ['pages_count' => count($mostVisitedPages)]);

            // Format pie chart data
            $pieData = collect($mostVisitedPages)->take(6)->map(function ($page) {
                return [
                    'name' => $this->truncatePageTitle($page['pageTitle'] ?? 'Unknown'),
                    'url' => $page['fullPageUrl'] ?? '',
                    'value' => $page['screenPageViews'] ?? 0
                ];
            })->filter(fn($item) => $item['value'] > 0)->values()->all();

            // Format data for bar chart
            $barData = $this->formatBarChartData($visitorsData);

            // Get real-time active users
            $realtimeActiveUsers = $this->analyticsService->getRealtimeActiveUsers();

            // Get summary statistics
            $summaryStats = $this->analyticsService->getSummaryStats(30);

            Log::info('Data prepared successfully');

        } catch (\Exception $e) {
            Log::error('Analytics error: ' . $e->getMessage());

            // Fallback to empty data
            $totalVisitors = 0;
            $totalPageviews = 0;
            $realtimeActiveUsers = 0;
            $pieData = [];
            $barData = [];
            $summaryStats = [
                'pageViews' => 0,
                'sessions' => 0,
                'totalUsers' => 0,
                'newUsers' => 0,
                'avgSessionDuration' => 0,
                'bounceRate' => 0,
            ];
        }

        return Inertia::render('Dashboard', [
            'visitors' => [
                'visitors' => $totalVisitors,
                'pageviews' => $totalPageviews,
                'activeUsers' => $realtimeActiveUsers,
                'summary' => $summaryStats
            ],
            'pieData' => $pieData,
            'barData' => $barData,
        ]);
    }

    /**
     * Format the visitors data for bar chart
     */
    private function formatBarChartData($visitorsData): array
    {
        if (empty($visitorsData)) {
            return [];
        }

        $formattedData = [];

        // Ensure we have exactly 7 days of data (last 7 days)
        $startDate = Carbon::now()->subDays(6);
        $endDate = Carbon::now();
        
        // Create a map of existing data by date
        $dataByDate = [];
        foreach ($visitorsData as $dayData) {
            $date = Carbon::parse($dayData['date']);
            $dataByDate[$date->format('Y-m-d')] = [
                'visitors' => $dayData['visitors'] ?? 0,
                'pageViews' => $dayData['pageViews'] ?? 0
            ];
        }

        // Generate data for last 7 days
        for ($i = 0; $i < 7; $i++) {
            $date = $startDate->copy()->addDays($i);
            $dateString = $date->format('Y-m-d');
            
            $formattedData[] = [
                'name' => $date->format('D'),
                'fullDate' => $dateString,
                'visitors' => $dataByDate[$dateString]['visitors'] ?? 0,
                'pageviews' => $dataByDate[$dateString]['pageViews'] ?? 0
            ];
        }

        return $formattedData;
    }

    /**
     * Truncate page title if too long
     */
    private function truncatePageTitle($title, $length = 40)
    {
        if (strlen($title) <= $length) {
            return $title;
        }
        
        return substr($title, 0, $length) . '...';
    }

    /**
     * API endpoint to fetch data for different time periods
     */
    public function getChartData(Request $request)
    {
        $period = $request->input('period', '7days');
        
        try {
            $days = 7;
            
            switch ($period) {
                case '30days':
                    $days = 30;
                    break;
                case '90days':
                    $days = 90;
                    break;
            }

            $visitorsData = $this->analyticsService->getTotalVisitorsAndPageViews($days);
            $barData = $this->formatBarChartData($visitorsData);

            return response()->json([
                'success' => true,
                'barData' => $barData,
                'period' => $period,
            ]);

        } catch (\Exception $e) {
            Log::error('Chart data error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch chart data',
                'barData' => [],
            ], 500);
        }
    }

    /**
     * Get real-time data
     */
    public function getRealtimeData(Request $request)
    {
        try {
            $activeUsers = $this->analyticsService->getRealtimeActiveUsers();
            
            return response()->json([
                'success' => true,
                'activeUsers' => $activeUsers,
                'timestamp' => now()->toIso8601String()
            ]);

        } catch (\Exception $e) {
            Log::error('Realtime data error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch real-time data',
                'activeUsers' => 0
            ], 500);
        }
    }

    /**
     * Get top pages data
     */
    public function getTopPages(Request $request)
    {
        try {
            $limit = $request->input('limit', 10);
            $days = $request->input('days', 30);
            
            $pages = $this->analyticsService->getMostVisitedPages($days, $limit);
            
            $formattedPages = collect($pages)->map(function ($page) {
                return [
                    'name' => $this->truncatePageTitle($page['pageTitle'] ?? 'Unknown'),
                    'url' => $page['fullPageUrl'] ?? '',
                    'value' => $page['screenPageViews'] ?? 0
                ];
            })->filter(fn($item) => $item['value'] > 0)->values()->all();

            return response()->json([
                'success' => true,
                'pages' => $formattedPages,
                'total' => count($formattedPages)
            ]);

        } catch (\Exception $e) {
            Log::error('Top pages error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch top pages',
                'pages' => []
            ], 500);
        }
    }

    /**
     * Test GA4 connection
     */
    public function testGA4Connection()
    {
        try {
            $result = $this->analyticsService->testConnection();
            
            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to test GA4 connection',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}