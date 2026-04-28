import { Hono } from 'hono';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { vendorAuth } from '../middleware/auth.js';
import { createServiceSchema, updateServiceSchema } from '../validators/index.js';

const servicesRouter = new Hono();

// GET /api/services — public: list all services (with vendor info)
servicesRouter.get('/', async (c) => {
  const category = c.req.query('category');
  
  let filter: any = {};
  if (category) filter.category = category;

  const services = await Service.find(filter)
    .populate('vendorId', 'name')
    .sort({ createdAt: -1 });

  const data = services.map(s => ({
    id: s._id,
    name: s.name,
    category: s.category,
    price: s.price,
    description: s.description,
    createdAt: (s as any).createdAt,
    vendor: {
      id: (s.vendorId as any)._id,
      name: (s.vendorId as any).name,
    }
  }));

  return c.json({ success: true, data });
});

// GET /api/services/mine — vendor: get own services
servicesRouter.get('/mine', vendorAuth, async (c) => {
  const user = c.get('user');

  const data = await Service.find({ vendorId: user.id })
    .sort({ createdAt: -1 });

  return c.json({ 
    success: true, 
    data: data.map(s => ({
      ...s.toObject(),
      id: s._id
    })) 
  });
});

// POST /api/services — vendor: create service
servicesRouter.post('/', vendorAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const result = createServiceSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, message: result.error.errors[0].message },
      400
    );
  }

  const service = await Service.create({
    ...result.data,
    vendorId: user.id,
  });

  return c.json({ 
    success: true, 
    message: 'Service added!', 
    data: { ...service.toObject(), id: service._id } 
  }, 201);
});

// PUT /api/services/:id — vendor: update own service
servicesRouter.put('/:id', vendorAuth, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  const result = updateServiceSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, message: result.error.errors[0].message },
      400
    );
  }

  const service = await Service.findOneAndUpdate(
    { _id: id, vendorId: user.id },
    { ...result.data },
    { new: true }
  );

  if (!service) {
    return c.json({ success: false, message: 'Service not found' }, 404);
  }

  return c.json({ 
    success: true, 
    message: 'Service updated!', 
    data: { ...service.toObject(), id: service._id } 
  });
});

// DELETE /api/services/:id — vendor: delete own service
servicesRouter.delete('/:id', vendorAuth, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const service = await Service.findOneAndDelete({ _id: id, vendorId: user.id });

  if (!service) {
    return c.json({ success: false, message: 'Service not found' }, 404);
  }

  return c.json({ success: true, message: 'Service deleted!' });
});

export default servicesRouter;
