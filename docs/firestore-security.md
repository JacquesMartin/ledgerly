# Firestore Security Rules Documentation

## Overview
This document explains the enhanced Firestore security rules implemented for the Ledgerly application. These rules provide comprehensive data protection and ensure users can only access and modify their own data.

## Security Principles

### 1. Authentication Required
- All operations require user authentication
- No anonymous access to any data

### 2. Data Ownership
- Users can only access their own data
- Strict ownership validation for all operations

### 3. Data Validation
- Input validation for all data types
- Prevention of data tampering
- Type checking for all fields

### 4. Principle of Least Privilege
- Users have minimal required permissions
- No unnecessary access granted

## Collection Rules

### Users Collection (`/users/{userId}`)
- **Read/Write**: Users can only manage their own profile
- **Create**: Must include valid user data (uid, email, name)
- **Update**: Prevents UID changes after creation
- **Validation**: Ensures data integrity and proper format

### User Preferences (`/user_preferences/{userId}`)
- **Read/Write**: Users can only manage their own preferences
- **Currency**: Must be one of: USD, EUR, GBP, JPY
- **Owner Validation**: Strict ownership checking

### Creditors (`/users/{userId}/creditors/{creditorId}`)
- **Read/Write**: Users can manage their own creditors list
- **Status Validation**: Must be 'approved' or 'pending'
- **Required Fields**: id, name, email, status

### Loan Applications (`/loan_applications/{applicationId}`)
- **Read**: Users can read applications where they are applicant OR creditor
- **Create**: Only applicants can create, with full validation
- **Update**: Creditors and applicants can update with restrictions
- **Delete**: Only creditors can delete their applications
- **Validation**: Comprehensive data validation including:
  - Amount > 0
  - Term months > 0
  - Interest rate >= 0
  - Valid status values
  - Required fields present

### Notifications (`/notifications/{notificationId}`)
- **Read/Write**: Users can only access their own notifications
- **Create**: Valid notification data required
- **Update**: Limited to isRead status and message updates
- **Type Validation**: Must be valid notification type

### Subscriptions (`/subscriptions/{userId}`)
- **Read/Write**: Users can manage their own subscription
- **Plan Validation**: Must be 'Free' or 'Pro'
- **Owner Validation**: Strict ownership checking

### Payments (`/payments/{paymentId}`)
- **Read/Write**: Users can access payments where they are payer OR receiver
- **Create**: Must include all required fields
- **Validation**: Proper payment data structure

## Helper Functions

### `isAuthenticated()`
- Checks if user is logged in
- Used for all operations

### `isOwner(userId)`
- Validates user ownership
- Combines authentication and ownership check

### `isValidUserData()`
- Validates user profile data
- Ensures required fields and correct types

### `isValidLoanApplication()`
- Comprehensive loan application validation
- Checks all required fields and data types
- Validates business logic (positive amounts, etc.)

### `isValidNotification()`
- Validates notification data structure
- Ensures proper notification types

## Security Features

### 1. Data Integrity
- Prevents field tampering
- Validates data types
- Enforces business rules

### 2. Access Control
- Role-based access (applicant vs creditor)
- Ownership-based permissions
- Principle of least privilege

### 3. Input Validation
- Comprehensive field validation
- Type checking
- Business rule enforcement

### 4. Audit Trail
- All operations logged
- User identification required
- Data change tracking

## Deployment

To deploy these rules to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

## Testing

Test the rules using the Firebase Emulator Suite:

```bash
firebase emulators:start --only firestore
```

## Monitoring

Monitor rule usage and violations in the Firebase Console:
- Go to Firestore → Rules
- Check the "Rules playground" for testing
- Monitor usage in the "Usage" tab

## Best Practices

1. **Regular Review**: Review rules periodically
2. **Testing**: Test all operations with different user roles
3. **Monitoring**: Monitor for rule violations
4. **Updates**: Update rules as application evolves
5. **Documentation**: Keep documentation current

## Common Issues

### Permission Denied Errors
- Check user authentication
- Verify ownership of data
- Ensure proper field validation

### Data Validation Errors
- Check required fields
- Verify data types
- Ensure business rule compliance

### Performance Issues
- Optimize rule complexity
- Use indexes for queries
- Monitor rule evaluation costs
