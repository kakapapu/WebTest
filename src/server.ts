import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const preferredPort = Number(process.env.PORT || 3006);
const rootDir = process.cwd();
const uploadDir = path.join(rootDir, 'uploads');

function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`Node + TS server running at http://localhost:${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on port ${fallbackPort}...`);
      startServer(fallbackPort);
      return;
    }

    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

fs.mkdirSync(uploadDir, { recursive: true });

const db = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : null;

const sampleDocuments = [
  {
    id: 1,
    ma_tai_lieu: 'KD-001',
    ten_tai_lieu: 'Bảng báo giá thiết bị điện tử 2026',
    mo_ta: 'Danh sách giá bán thiết bị điện tử và phụ kiện cho khách hàng.',
    danh_muc: 'Báo giá',
    version: '1.0',
    file_url: '/uploads/demo-kd-001.pdf',
    ten_bo_phan: 'Kinh doanh',
    nguoi_tao: 'Nguyễn Thị Lan',
  },
  {
    id: 2,
    ma_tai_lieu: 'KT-001',
    ten_tai_lieu: 'Hướng dẫn triển khai hệ thống mới',
    mo_ta: 'Tài liệu kỹ thuật triển khai, cấu hình và kiểm thử hệ thống.',
    danh_muc: 'Hướng dẫn',
    version: '1.5',
    file_url: '/uploads/demo-kt-001.pdf',
    ten_bo_phan: 'Kỹ thuật',
    nguoi_tao: 'Trần Văn Hùng',
  },
  {
    id: 3,
    ma_tai_lieu: 'NS-001',
    ten_tai_lieu: 'Quy chế làm việc nội bộ 2026',
    mo_ta: 'Quy định thời gian làm việc, nghỉ phép, kỷ luật và nội quy.',
    danh_muc: 'Quy định',
    version: '1.0',
    file_url: '/uploads/demo-ns-001.pdf',
    ten_bo_phan: 'Nhân sự',
    nguoi_tao: 'Phạm Thị Mai',
  },
  {
    id: 4,
    ma_tai_lieu: 'TC-001',
    ten_tai_lieu: 'Hướng dẫn thanh toán và hóa đơn',
    mo_ta: 'Quy trình xuất hóa đơn, thanh toán và theo dõi công nợ.',
    danh_muc: 'Tài chính',
    version: '2.1',
    file_url: '/uploads/demo-tc-001.pdf',
    ten_bo_phan: 'Tài chính',
    nguoi_tao: 'Lê Quốc Anh',
  },
  {
    id: 5,
    ma_tai_lieu: 'HC-001',
    ten_tai_lieu: 'Mẫu văn bản hành chính nội bộ',
    mo_ta: 'Các mẫu đề xuất, công văn, biên bản và biểu mẫu điều hành.',
    danh_muc: 'Văn bản',
    version: '1.2',
    file_url: '/uploads/demo-hc-001.pdf',
    ten_bo_phan: 'Hành chính',
    nguoi_tao: 'Hoàng Thị Hòa',
  },
];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    callback(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowed = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
      'zip',
      'rar',
      'png',
      'jpg',
      'jpeg',
    ];
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    callback(null, allowed.includes(ext));
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function filterDocuments(items: any[], search: string, department: string, category: string) {
  const q = search.trim().toLowerCase();
  const dept = department.trim();
  const cat = category.trim();

  return items.filter((item) => {
    const matchesSearch =
      q === '' ||
      item.ten_tai_lieu?.toLowerCase().includes(q) ||
      item.ma_tai_lieu?.toLowerCase().includes(q) ||
      item.mo_ta?.toLowerCase().includes(q) ||
      item.ten_bo_phan?.toLowerCase().includes(q) ||
      item.danh_muc?.toLowerCase().includes(q);

    const matchesDepartment = dept === '' || item.ten_bo_phan === dept;
    const matchesCategory = cat === '' || item.danh_muc === cat;

    return matchesSearch && matchesDepartment && matchesCategory;
  });
}

async function getDocumentsFromDb(search: string, department: string, category: string) {
  if (!db) {
    return filterDocuments(sampleDocuments, search, department, category);
  }

  try {
    const conditions: string[] = ['t.is_active = true'];
    const params: any[] = [];

    if (search) {
      conditions.push('(t.ten_tai_lieu ILIKE $1 OR t.mo_ta ILIKE $1 OR t.ma_tai_lieu ILIKE $1 OR b.ten_bo_phan ILIKE $1)');
      params.push(`%${search}%`);
    }

    if (department) {
      conditions.push('b.ten_bo_phan = $' + (params.length + 1));
      params.push(department);
    }

    if (category) {
      conditions.push('t.danh_muc = $' + (params.length + 1));
      params.push(category);
    }

    const sql = `
      SELECT t.id, t.ma_tai_lieu, t.ten_tai_lieu, t.mo_ta, t.danh_muc, t.version, t.file_url,
             b.ten_bo_phan,
             u.ho_ten AS nguoi_tao
      FROM tai_lieu t
      INNER JOIN bo_phan b ON b.id = t.bo_phan_id
      LEFT JOIN nguoi_dung u ON u.id = t.created_by
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.updated_at DESC
    `;

    const result = await db.query(sql, params);
    return result.rows;
  } catch (error) {
    console.warn('Database query failed, using demo data:', error);
    return filterDocuments(sampleDocuments, search, department, category);
  }
}

app.get('/api/documents', async (req: Request, res: Response) => {
  const search = String(req.query.search ?? '');
  const department = String(req.query.department ?? '');
  const category = String(req.query.category ?? '');

  const data = await getDocumentsFromDb(search, department, category);

  res.json({
    success: true,
    count: data.length,
    data,
  });
});

app.post('/api/documents/upload', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  const body = req.body;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn file tài liệu để upload.',
    });
  }

  const requiredFields = ['ma_tai_lieu', 'ten_tai_lieu', 'danh_muc', 'bo_phan_id'];
  const missing = requiredFields.filter((field) => !body[field]);
  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin bắt buộc: ' + missing.join(', '),
    });
  }

  const fileUrl = `/uploads/${file.filename}`;
  const departmentMap: Record<string, string> = {
    '1': 'Kinh doanh',
    '2': 'Kỹ thuật',
    '3': 'Nhân sự',
    '4': 'Tài chính',
    '5': 'Hành chính',
    '6': 'Marketing',
  };

  const savedDocument = {
    id: Date.now(),
    ma_tai_lieu: body.ma_tai_lieu,
    ten_tai_lieu: body.ten_tai_lieu,
    mo_ta: body.mo_ta || 'Tài liệu được upload từ hệ thống nội bộ.',
    danh_muc: body.danh_muc,
    version: body.version || '1.0',
    file_url: fileUrl,
    ten_bo_phan: departmentMap[String(body.bo_phan_id)] || 'Khác',
    nguoi_tao: 'Nhân viên nội bộ',
  };

  if (db) {
    try {
      await db.query(
        `INSERT INTO tai_lieu (ma_tai_lieu, ten_tai_lieu, mo_ta, bo_phan_id, danh_muc, file_url, version, created_by, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW())`,
        [
          savedDocument.ma_tai_lieu,
          savedDocument.ten_tai_lieu,
          savedDocument.mo_ta,
          Number(body.bo_phan_id),
          savedDocument.danh_muc,
          fileUrl,
          savedDocument.version,
        ],
      );
    } catch (error) {
      console.error('Insert to database failed:', error);
      fs.unlinkSync(file.path);
      return res.status(500).json({
        success: false,
        message: 'Upload thất bại: không thể lưu vào PostgreSQL. Kiểm tra DATABASE_URL, mật khẩu và schema database.',
      });
    }
  }

  return res.status(201).json({
    success: true,
    message: 'Tải lên tài liệu thành công.',
    count: 1,
    data: [savedDocument],
  });
});

app.get('/health', async (_req: Request, res: Response) => {
  let database = 'demo mode';

  if (db) {
    try {
      await db.query('SELECT 1');
      database = 'connected';
    } catch (error) {
      database = 'not connected';
      console.error('Database health check failed:', error);
    }
  }

  res.json({
    success: true,
    message: 'Server đang hoạt động.',
    database,
  });
});

app.use('/uploads', express.static(uploadDir));
app.use(express.static(rootDir));

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

startServer(preferredPort);
