# Product Management Implementation

## Overview
Complete implementation of Product Management functionality for the Maksaby Frontend application, including full CRUD operations with image upload support.

## API Endpoints Integrated

### 1. Get All Products
- **Endpoint**: `GET /Product/getallproducts`
- **Parameters**: 
  - `pagenum` (default: 1)
  - `pagesize` (default: 50, max: 50)
  - `SearchTerm` (optional)
- **Features**: Pagination and search support

### 2. Get Product by ID
- **Endpoint**: `GET /Product/{productId}`
- **Parameter**: Product ID

### 3. Add Product
- **Endpoint**: `POST /Product/addproduct`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - Name (required)
  - BuyingPrice (required)
  - SellingPrice (required)
  - Stock (required)
  - ImageUrl (optional file upload)
  - Description (optional)

### 4. Update Product
- **Endpoint**: `PATCH /Product/updateproduct`
- **Content-Type**: `multipart/form-data`
- **Fields**: Same as Add + Id field

### 5. Delete Product
- **Endpoint**: `DELETE /Product/{productId}`
- **Parameter**: Product ID

## Files Modified/Created

### 1. `types/index.ts`
Updated Product interface and added ProductFormData:
```typescript
export interface Product {
  id: string
  name: string
  buyingPrice: number
  sellingPrice: number
  stock: number
  imageUrl?: string | null
  description?: string | null
}

export interface ProductFormData {
  name: string
  buyingPrice: number
  sellingPrice: number
  stock: number
  imageUrl?: File | null
  description?: string
  id?: string
}
```

### 2. `lib/api-client.ts`
Added comprehensive API functions:
- `getAllProducts()` - With pagination and search
- `getProductById()` - Fetch single product
- `addProduct()` - Create new product with FormData
- `updateProduct()` - Update existing product
- `deleteProduct()` - Soft delete product

### 3. `components/product-form-dialog.tsx` ✨ NEW
Reusable modal dialog component for adding/editing products:
- Form validation
- Image upload with preview
- Real-time image preview
- Loading states
- Error handling
- RTL (Right-to-Left) support for Arabic

### 4. `app/dashboard/products/page.tsx`
Complete product management page with:
- Product grid display with cards
- Search functionality
- Pagination controls
- Add/Edit/Delete operations
- Image display with fallback
- Profit margin calculation
- Stock level indicators
- Responsive design

## Features Implemented

### ✅ Product Listing
- Grid layout with responsive cards
- Product images with fallbacks
- Key information display (prices, stock, profit margin)
- Low stock warnings (≤5 items highlighted in red)

### ✅ Search & Filter
- Real-time search by product name
- Automatic pagination reset on search
- Empty state messages

### ✅ Pagination
- Navigate between pages
- Configurable page size (default: 20)
- Previous/Next buttons with proper disable states

### ✅ Add Product
- Modal form dialog
- All required fields
- Optional image upload
- Optional description
- Client-side validation
- FormData submission for multipart content

### ✅ Edit Product
- Pre-populated form with existing data
- Image preview of current image
- Ability to change image
- Same validation as add

### ✅ Delete Product
- Confirmation dialog
- Optimistic UI updates
- Error handling with user feedback

### ✅ Image Handling
- File upload support
- Image preview before submission
- Display existing images
- Fallback UI for products without images

### ✅ User Experience
- Loading states for all operations
- Toast notifications for success/errors
- Arabic language support (RTL)
- Responsive design for all screen sizes
- Smooth transitions and hover effects

## Technical Details

### Form Data Handling
The implementation properly handles multipart/form-data for file uploads:
```typescript
const formData = new FormData()
formData.append('Name', data.name)
formData.append('BuyingPrice', data.buyingPrice.toString())
formData.append('SellingPrice', data.sellingPrice.toString())
formData.append('Stock', data.stock.toString())
if (data.imageUrl) {
  formData.append('ImageUrl', data.imageUrl)
}
if (data.description) {
  formData.append('Description', data.description)
}
```

### State Management
- React Query for server state management
- Query invalidation for automatic refetching
- Optimistic updates for better UX
- Local state for UI controls (modals, pagination)

### Error Handling
- Try-catch blocks in API functions
- Axios interceptor for 401 errors
- User-friendly error messages in Arabic
- Toast notifications for all operations

## Usage Example

### Add a Product
1. Click "إضافة منتج" button
2. Fill in required fields (name, buying price, selling price, stock)
3. Optionally upload an image
4. Optionally add description
5. Click "إضافة المنتج" to submit

### Edit a Product
1. Click "تعديل" on any product card
2. Modify desired fields
3. Click "تحديث المنتج" to save changes

### Delete a Product
1. Click "حذف" on any product card
2. Confirm deletion in the prompt
3. Product will be removed from the list

### Search Products
1. Type in the search box
2. Results filter in real-time
3. Pagination resets to page 1

## Dependencies Used
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client
- `react-hot-toast` - Toast notifications
- `lucide-react` - Icons
- `shadcn/ui` - UI components

## Future Enhancements
- Bulk operations (delete multiple, export)
- Advanced filtering (by price range, stock level)
- Sorting options (by name, price, stock)
- Product categories/tags
- Barcode scanning for quick add
- Product history/audit log
- Import/Export CSV functionality

## Testing Checklist
- ✅ Add product with image
- ✅ Add product without image
- ✅ Edit product and change image
- ✅ Edit product without changing image
- ✅ Delete product
- ✅ Search products
- ✅ Navigate pagination
- ✅ Handle API errors gracefully
- ✅ Form validation works
- ✅ Responsive design on mobile

## Notes
- All text is in Arabic (RTL layout)
- Images are stored via ImageKit CDN
- Soft delete implementation (isDeleted flag in backend)
- Stock levels of 5 or less show warning color
- Profit margin calculated and displayed as percentage
