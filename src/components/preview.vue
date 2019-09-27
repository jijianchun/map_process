<template>
  <div class="wrap">
    <div style="width: 80%;margin: 0 auto 20px">
      <el-button class="btn" :class="{'active': currentId === 0}" @click="getAll()">总览</el-button>
      <el-button class="btn" :class="{'active': item.id === currentId}" v-for="(item, index) in provinceList" :key="index" @click="getOne(item.id)">
        {{item.name}}
      </el-button>
    </div>
    <el-table :data="previewList" border style="width:80%; margin: 0 auto;" :row-class-name="tableRowClassName">
      <el-table-column :label="type === 'province' ? '省份' : '城市'" width="200" align="center">
        <template slot-scope="scope">
          <span v-if="type === 'province'">{{scope.row.name}}</span>
          <span v-if="type === 'city'">{{scope.row.city_name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center" v-if="type === 'city'">
        <template slot-scope="scope">
          <span v-if="!scope.row.editable">{{scope.row.status}}</span>
          <el-input v-if="scope.row.editable" v-model="scope.row.status" style="width:200px;" placeholder="请输入进度"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center" v-if="type === 'province'">
        <template slot-scope="scope">
          <span v-if="!scope.row.editable" class="process_detail">
            <i>总数:{{parseInt(scope.row.finish) + parseInt(scope.row.ing) + parseInt(scope.row.noyet)}}</i>
            <i>已完成:{{parseInt(scope.row.finish)}}</i>
            <i>正在下载:{{parseInt(scope.row.ing)}}</i>
            <i>未下载:{{parseInt(scope.row.noyet)}}</i>
          </span>
          <el-input v-if="scope.row.editable" v-model="scope.row.finish" style="width: 80px;" placeholder="请输入已完成数"></el-input>
          <el-input v-if="scope.row.editable" v-model="scope.row.ing" style="width:80px;" placeholder="请输入正在下载数"></el-input>
          <el-input v-if="scope.row.editable" v-model="scope.row.noyet" style="width:80px;" placeholder="请输入未下载数"></el-input>
        </template>
      </el-table-column>
       <el-table-column label="百分比" align="center" v-if="type === 'province'">
        <template slot-scope="scope">
           <span v-if="!scope.row.editable">{{scope.row.percent}}%</span>
           <el-input v-if="scope.row.editable" v-model="scope.row.percent" style="width:100px;" placeholder="请输入百分比"></el-input>
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
      previewList: [] // 表格列表
    };
  },
  mounted() {
    this.getPreviewList();
  },
  methods: {
    // 表格行颜色
    tableRowClassName({row, rowIndex}) {
      if (row.percent) {
         if (row.percent === '0.00') {
          return 'gray-row';
        } else if (row.percent === '100.00') {
          return 'green-row';
        } else {
          return 'yellow-row';
        }
      } else {
        return '';
      }
    },
    // 获取预览列表
    getPreviewList() {
      axios({
        params: {
          a: 'preview'
        },
        method: 'get'
      }).then(res => {
        // 省按钮列表
        this.provinceList = res.data.map(item => {
          return {
            id: item.id,
            name: item.name
          }
        });
        // 预览列表
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
        id: this.previewList[index].id
      };
      if (this.type === 'province') {
        data.finish = this.previewList[index].finish;
        data.ing = this.previewList[index].ing;
        data.noyet = this.previewList[index].noyet;
        data.percent = this.previewList[index].percent;
      }
      if (this.type === 'city') {
        data.ip = this.previewList[index].ip;
        data.status = this.previewList[index].status;
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
.process_detail i{
  font-style: normal;
  display: inline-block;
  width: 90px;
}
/deep/ .el-table__body tr:hover>td {
  background-color: transparent !important;
}
/deep/ .el-table .green-row {
  background: #9EEA6A;
}
/deep/ .el-table .yellow-row {
  background: #FFC517;
}
/deep/ .el-table .gray-row {
  background: #DBD9D8;
}
</style>
