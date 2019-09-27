<template>
  <div class="wrap">
    <div style="width: 80%;margin: 0 auto 20px">
      <el-button class="btn" :class="{'active': currentId === 0}" @click="getAll()">总览</el-button>
      <el-button class="btn" :class="{'active': item.id === currentId}" v-for="(item, index) in provinceList" :key="index" @click="getOne(item.id)">
        {{item.name}}
      </el-button>
    </div>
    <div style="width: 80%;margin: 0 auto 20px;text-align:center;">
      <el-button type="primary" @click="addNewCity()">新增城市</el-button>
    </div>
    <el-table :data="previewList" stripe border style="width:80%; margin: 0 auto;">
      <el-table-column :label="type === 'province' ? '省份' : '城市'" width="200" align="center">
        <template slot-scope="scope">
          <span v-if="type === 'province'">{{scope.row.name}}</span>
          <span v-if="type === 'city'">{{scope.row.city_name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center">
        <template slot-scope="scope">
          <span v-if="!scope.row.editable">{{scope.row.status}}</span>
          <el-input v-if="scope.row.editable" v-model="scope.row.status" style="width:200px;" placeholder="请输入进度"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="ip" align="center" v-if="type === 'city'">
        <template slot-scope="scope">
          <span v-if="!scope.row.editable">{{scope.row.ip}}</span>
          <el-input v-if="scope.row.editable" v-model="scope.row.ip" style="width:200px;" placeholder="请输入ip"></el-input>
        </template>
      </el-table-column>
      <el-table-column width="100" label="操作" align="center">
						<template slot-scope="scope">
							<el-button v-if="!scope.row.editable" type="text" size="small" @click="editStatus(scope.$index)">编辑</el-button>
              <span v-if="type === 'province'">
							  <el-button v-if="scope.row.editable" type="text" size="small" @click="saveStatus(scope.$index, 'province')">保存</el-button>
              </span>
              <span v-if="type === 'city'">
							  <el-button v-if="scope.row.editable" type="text" size="small" @click="saveStatus(scope.$index, 'city')">保存</el-button>
              </span>
						</template>
					</el-table-column>
    </el-table>
    <!-- 数据预览弹窗 -->
    <el-dialog title="新增城市" :visible.sync="addVisible" width="400px" @close="closePreview">
				<el-form :model="addForm" style="background:#fff;" label-width="70px" :inline="true">
					<el-form-item label="省份:" size="small">
            <el-select v-model="addForm.id" filterable placeholder="请选择城市">
              <el-option v-for="(item,index) in provinceList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
					</el-form-item>
          <el-form-item label="城市:" size="small">
						<el-input v-model="addForm.name" style="width:215px;" placeholder="请输入城市名称"></el-input>
					</el-form-item>
          <el-form-item label="进度:" size="small">
						<el-input v-model="addForm.status" style="width:215px;" placeholder="请输入进度"></el-input>
					</el-form-item>
          <el-form-item label="IP:" size="small">
						<el-input v-model="addForm.ip" style="width:215px;" placeholder="请输入IP"></el-input>
					</el-form-item>
				</el-form>
        <div slot="footer" class="dialog-footer">
				  <el-button type="primary" @click="addNewCityConfirm()">确定</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
axios.defaults.baseURL = 'http://10.68.8.145/map_down/index.php';
export default {
  name: "preview",
  data() {
    return {
      currentId: 0,  // 当前省ID
      type: 'province', // 表格数据类型:省/市
      provinceList: [], // 省份列表
      previewList: [], // 表格列表
      addForm: {
        id: '',
        name: '',
        status: '',
        ip: ''
      },
      addVisible: false  // 新增弹框
    };
  },
  mounted() {
    this.getProvinceList();
    this.getPreviewList();
  },
  methods: {
    // 关闭新增弹框
    closePreview() {
      this.addVisible = false;
      this.addForm = {
        id: '',
        name: '',
        status: '',
        ip: ''
      };
    },
    // 新增城市
    addNewCity() {
      this.addVisible = true;
    },
    // 新增城市表单提交
    addNewCityConfirm() {
      axios({
        params: {
          a: 'addCity'
        },
        method: 'post',
        data: {
          id: this.addForm.id,
          name: this.addForm.name,
          status: this.addForm.status,
          ip: this.addForm.ip
        }
      }).then(res => {
        if (res.data.status === 200) {
          this.$message.success(res.data.message);
          this.addVisible = false;
          this.getOne(this.currentId);
        } else {
          this.$message.error(res.data.message);
          return false;
        }
      });
    },
    // 获取省份列表
    getProvinceList() {
      axios({
        params: {
          a: 'getProvinceList'
        },
        method: 'get'
      }).then(res => {
        this.provinceList = res.data;
      });
    },
    // 获取预览列表
    getPreviewList() {
      axios({
        params: {
          a: 'preview'
        },
        method: 'get'
      }).then(res => {
        this.previewList = res.data.map(item => {
          return {
            ...item,
            editable: false
          }
        });
      });
    },
    // 获取单个省份数据
    getOne(id) {
      this.type = 'city';
      this.currentId = id;
      axios({
        params: {
          a: 'getOne'
        },
        method: 'post',
        data: {
          id: id
        }
      }).then(res => {
        this.previewList = res.data.map(item => {
          return {
            ...item,
            editable: false
          }
        });
      });
    },
    // 总览
    getAll() {
      this.type = 'province';
      this.getPreviewList();
    },
    // 编辑进度
		editStatus(index) {
			this.previewList[index].editable = true;
    },
    saveStatus(index) {
      let data = {
        type: this.type,
        id: this.previewList[index].id,
        status: this.previewList[index].status
      };
      if (this.type === 'city') {
        data.ip = this.previewList[index].ip;
      }
      axios({
        params: {
          a: 'update'
        },
        method: 'post',
        data: data
      }).then(res => {
        if (res.data.status === 200) {
          this.$message.success(res.data.message);
          this.previewList[index].editable = false;
        } else {
          this.previewList[index].editable = false;
          this.$message.error(res.data.message);
          return false;
        }
      }).catch(err => {
        this.previewList[index].editable = false;
        this.$message.error(err);
        return false;
      })
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.btn {
  margin-bottom: 10px;
}
.btn.active {
  color: blue;
}
</style>
