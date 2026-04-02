$ErrorActionPreference = 'SilentlyContinue'
$routes = @(
    @{ Method='GET'; Url='/health' },
    @{ Method='GET'; Url='/metrics' },
    @{ Method='POST'; Url='/api/auth/send-otp'; Body='{"phone":"+919999999999"}' },
    @{ Method='GET'; Url='/api/products' },
    @{ Method='GET'; Url='/api/products/64a2b2c3d4e5f6a9b8c7d6e5' },
    @{ Method='POST'; Url='/api/orders'; Body='{}' },
    @{ Method='GET'; Url='/api/user/profile' },
    @{ Method='POST'; Url='/api/chat/ask'; Body='{"message":"Hello"}' },
    @{ Method='GET'; Url='/api/chat/history' },
    @{ Method='GET'; Url='/api/admin/stats' },
    @{ Method='GET'; Url='/api/payment/checkout/123' },
    @{ Method='POST'; Url='/api/payment/verify'; Body='{"signature":"test"}' }
)

foreach ($r in $routes) {
    try {
        $params = @{
            Uri = "http://127.0.0.1:4000"
            Method = $r.Method
            Headers = @{"Content-Type"="application/json"}
        }
        if ($r.ContainsKey('Body')) { $params.Body = $r.Body }
        
        $response = Invoke-WebRequest @params
        Write-Output "[  ]   - SUCCESS"
    } catch [System.Net.WebException] {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            $desc = $_.Exception.Response.StatusDescription
            Write-Output "[ $status ]   - CAUGHT ($desc)"
        } else {
            Write-Output "[ ERR ]   - "
        }
    }
}
