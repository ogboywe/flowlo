<!DOCTYPE html>
<html>
<head>
    <title>Shop Approved</title>
</head>
<body>
    <h1>Congratulations! Your Shop Has Been Approved</h1>
    
    <p>Dear {{ $shop->owner->name }},</p>
    
    <p>We're excited to inform you that your shop "{{ $shop->name }}" has been approved and is now active on our platform!</p>
    
    <p>You can now:</p>
    <ul>
        <li>Accept bookings from clients</li>
        <li>Manage your services and pricing</li>
        <li>Add barbers to your team</li>
        <li>Start earning revenue</li>
    </ul>
    
    <p>Next steps:</p>
    <ol>
        <li>Complete your Stripe Connect setup to receive payments</li>
        <li>Add your services and set pricing</li>
        <li>Invite barbers to join your shop</li>
        <li>Start accepting bookings!</li>
    </ol>
    
    <p>If you have any questions, please don't hesitate to contact our support team.</p>
    
    <p>Welcome to the platform!</p>
    
    <p>Best regards,<br>The Flowlo Team</p>
</body>
</html>
