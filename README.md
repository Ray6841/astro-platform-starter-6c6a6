# WMS Pro - Comprehensive Warehouse Management System

A full-stack warehouse management system (WMS) built with Astro, React, and TypeScript, featuring comprehensive warehousing operations and advanced capabilities.

## 🚀 Features

### Core WMS Operations
- **Warehouse Management**: Multi-warehouse support with location tracking
- **Inventory Management**: Real-time stock tracking with SKU management
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Receiving Operations**: ASN processing and inbound shipment management
- **Task Management**: Picking, packing, replenishment, and cycle counting
- **Billing & 3PL**: Comprehensive billing for third-party logistics
- **Reporting & Analytics**: Real-time KPIs and performance metrics

### Advanced Capabilities
- **User Authentication**: Secure login with role-based access control
- **Real-time Updates**: Live inventory and order status tracking
- **Mobile Responsive**: Optimized for desktop and mobile/RF devices
- **API Integration**: RESTful APIs for ERP and TMS integration
- **Audit Trail**: Complete transaction history and compliance tracking

## 🏗️ Architecture

### Frontend
- **Astro**: Static site generation with React components
- **React**: Interactive UI components with TypeScript
- **Tailwind CSS**: Modern, responsive design system
- **Component-based**: Modular, reusable UI components

### Backend
- **Astro API Routes**: Server-side API endpoints
- **RESTful APIs**: Standard HTTP methods for data operations
- **Mock Data**: In-memory data storage for demonstration
- **Error Handling**: Comprehensive error management

### Data Models
- **Users & Roles**: Authentication and authorization
- **Warehouses**: Facility management and capacity tracking
- **Inventory**: SKU management with lot/serial tracking
- **Orders**: Customer orders with fulfillment tracking
- **Tasks**: Work assignments and labor management
- **Billing**: 3PL billing and cost tracking

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wms-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open [http://localhost:4321](http://localhost:4321)
   - Login with demo credentials: `admin` / `admin123`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
# Database configuration (for production)
DATABASE_URL=your_database_url

# Authentication
JWT_SECRET=your_jwt_secret

# API configuration
API_BASE_URL=http://localhost:4321
```

### Tailwind CSS
The project uses Tailwind CSS v4 with the following configuration:
- Responsive design utilities
- Custom color schemes
- Component-based styling

## 📱 Usage

### Dashboard
- Real-time KPIs and performance metrics
- Quick access to all major functions
- Recent activity overview

### Warehouse Management
- Add, edit, and delete warehouse facilities
- Track capacity and location information
- Manage warehouse staff and contact details

### Inventory Management
- SKU creation and management
- Stock level tracking with reorder points
- Location and lot number tracking
- Supplier information management

### Order Management
- Create and manage customer orders
- Track order status through fulfillment
- Multi-item order support
- Priority and shipping date management

### Task Management
- Assign picking, packing, and replenishment tasks
- Track task completion and worker productivity
- Cycle counting and inventory verification

### Billing & 3PL
- Storage, handling, and value-added service billing
- Customer-specific billing cycles
- Invoice generation and tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Warehouses
- `GET /api/warehouses` - List all warehouses
- `POST /api/warehouses` - Create new warehouse
- `PUT /api/warehouses` - Update warehouse
- `DELETE /api/warehouses` - Delete warehouse

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory` - Update inventory item
- `DELETE /api/inventory` - Delete inventory item

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders` - Update order
- `DELETE /api/orders` - Delete order

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks` - Update task
- `DELETE /api/tasks` - Delete task

### Receiving
- `GET /api/receiving` - List receiving orders
- `POST /api/receiving` - Create receiving order
- `PUT /api/receiving` - Update receiving order
- `DELETE /api/receiving` - Delete receiving order

### Billing
- `GET /api/billing` - List billing records
- `POST /api/billing` - Create billing record
- `PUT /api/billing` - Update billing record
- `DELETE /api/billing` - Delete billing record

## 🧪 Testing

### Manual Testing
1. **Authentication**: Test login with demo credentials
2. **CRUD Operations**: Test create, read, update, delete for all entities
3. **Navigation**: Verify all links and page transitions
4. **Responsive Design**: Test on desktop and mobile devices

### Automated Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Netlify Deployment
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Environment Configuration
- Configure environment variables in Netlify dashboard
- Set up custom domain if required
- Configure SSL certificates

## 📊 Performance

### Optimization Features
- **Static Generation**: Pre-built pages for fast loading
- **Code Splitting**: Automatic component lazy loading
- **Image Optimization**: Automatic image compression
- **Caching**: Browser and CDN caching strategies

### Monitoring
- **Real-time Metrics**: Performance monitoring dashboard
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage patterns and behavior tracking

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-based Access**: Granular permission control
- **Input Validation**: Comprehensive data validation
- **CSRF Protection**: Cross-site request forgery prevention

### Data Protection
- **Encryption**: Data encryption in transit and at rest
- **Audit Logging**: Complete transaction history
- **Backup Strategy**: Regular data backups
- **Compliance**: GDPR and industry compliance

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

### Contact
- **Email**: support@wms-pro.com
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core WMS functionality
- ✅ User authentication
- ✅ Basic reporting

### Phase 2 (Next)
- 🔄 Advanced analytics
- 🔄 Mobile app development
- 🔄 Integration APIs

### Phase 3 (Future)
- 📋 AI-powered optimization
- 📋 IoT device integration
- 📋 Advanced automation

---

**WMS Pro** - Empowering warehouse operations with modern technology and comprehensive management capabilities.
