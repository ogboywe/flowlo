<!DOCTYPE html>
<html>
<head>
    <title>Shop Application Update</title>
</head>
<body>
    <h1>Shop Application Update</h1>
    
    <p>Dear {{ $shop->owner->name }},</p>
    
    <p>Thank you for your interest in joining our platform. After reviewing your shop application for "{{ $shop->name }}", we regret to inform you that we cannot approve it at this time.</p>
    
    <p><strong>Reason:</strong> {{ $reason }}</p>
    
    <p>We encourage you to address the concerns mentioned above and resubmit your application. Our team is here to help you succeed, and we'd be happy to work with you to meet our platform requirements.</p>
    
    <p>If you have any questions about this decision or need guidance on how to improve your application, please contact our support team.</p>
    
    <p>Thank you for your understanding.</p>
    
    <p>Best regards,<br>The Flowlo Team</p>
</body>
</html>
