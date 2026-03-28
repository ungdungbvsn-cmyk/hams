import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getEquipmentTypesMaster = async (req: Request, res: Response) => {
  try {
    const types = await prisma.equipmentType.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
export const getUnifiedMasterData = async (req: Request, res: Response) => {
  try {
    const [departments, suppliers, equipmentTypes, assetStatuses] = await Promise.all([
      prisma.department.findMany({ orderBy: { name: 'asc' } }),
      prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
      prisma.equipmentType.findMany({ orderBy: { name: 'asc' } }),
      prisma.assetStatus.findMany({ orderBy: { matt: 'asc' } })
    ]);

    res.json({
      departments,
      suppliers,
      equipmentTypes,
      assetStatuses
    });
  } catch (error) {
    console.error('Unified Master Data Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
