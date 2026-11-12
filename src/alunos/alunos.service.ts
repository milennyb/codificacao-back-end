import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateAlunoDto } from "./dto/create-aluno.dto.js";
import { UpdateAlunoDto } from "./dto/update-aluno.dto.js";
import { Aluno, AlunoDoc } from "./dto/schemas/aluno.schemas.js";

@Injectable()
export class alunosService {
  constructor(
    @InjectModel(Aluno.name) private alunoModel: Model<AlunoDoc>,
  ) {}

  async create(createAlunoDto: CreateAlunoDto): Promise<Aluno> {
    const novoAluno = new this.alunoModel(createAlunoDto);
    return novoAluno.save();
  }

  async findOne(id: string): Promise<Aluno> {
    const aluno = await this.alunoModel.findById(id).exec();

    if (!aluno) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado.`);
    }

    return aluno;
  }

  async update(id: string, updateAlunoDto: UpdateAlunoDto): Promise<Aluno> {
    const aluno = await this.alunoModel.findByIdAndUpdate(id, updateAlunoDto, {
      new: true,
    }).exec();

    if (!aluno) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado.`);
    }

    return aluno;
  }

  async remove(id: string): Promise<Aluno> {
    const aluno = await this.alunoModel.findByIdAndDelete(id).exec();

    if (!aluno) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado.`);
    }

    return aluno;
  }

  async findpagefilter(
    page: number, 
    limit: number, 
    nome?: string,
    curso?: string,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',) {
    const skip = (page - 1) * limit;
    const filter: any = {};
    const sort: any = {};

    if (nome) {
      filter.nome = {
        $regex: new RegExp(nome, "i"),
      };
    }

    if (curso) {
      filter.cursos= curso;
    }
    if(orderBy){
      sort[orderBy] = orderDirection === 'desc' ? -1 : 1;
    }

    const [data, total] = await Promise.all([
      this.alunoModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.alunoModel.countDocuments(filter).exec(),
    ]);

    return { data,
      meta:{
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}