import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
// @ts-ignore
import * as am4core from '@amcharts/amcharts4/core';
// @ts-ignore
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { UsersService } from '../../core/users/services/users.service';
import { FundsService } from '../../core/funds/services/funds.service';
import { ExpencesService } from '../../core/expences/services/expences.service';
import { DashboardService } from '../../core/dashboard/services/dashboard.service';

am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // private chart: am4charts.XYChart;
  users: any = [];
  subusers: any = [];
  mainusers: any = [];
  funds: any = [];
  expence: any = [];
  UpcomingEvent: any = [];
  UpcomingBirthday: any = [];
  UpcomingDonation: any = [];
  LineChartSelectDateRang = false;
  EventChartSelectDateRang = false;

  LineChartLable: any = [];
  BarChartLable: any = [];
  LineChartFund: any = [];
  LineChartExpence: any = [];
  BarChartFund: any = [];
  BarChartExpence: any = [];
  TotalEvent = 0;
  TotalEventDonation = 0;
  TotalEventExpence = 0;

  totalfundactual_amount = 0;
  totalfundpaid_amount = 0;
  totalfundremaining_amount = 0;
  totalexpenceactual_amount = 0;
  totalexpencepaid_amount = 0;
  totalexpenceremaining_amount = 0;

  NetBalance = 0;
  TotalIncome = 0;
  TotalExpenses = 0;
  Family = 0;
  AllUserCount = 0;

  BarCharttotalfundactual_amount = 0;
  BarCharttotalfundpaid_amount = 0;
  BarCharttotalfundremaining_amount = 0;
  BarCharttotalexpenceactual_amount = 0;
  BarCharttotalexpencepaid_amount = 0;
  BarCharttotalexpenceremaining_amount = 0;

  constructor(
    public userService: UsersService,
    public fundService: FundsService,
    public expenceService: ExpencesService,
    private _ref: ChangeDetectorRef,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.userService.getAllUsers().subscribe(res => {
      this.users = res;
      this._ref.detectChanges();
    });
    this.userService.getAllSubUsers().subscribe(res => {
      this.subusers = res;
      this._ref.detectChanges();
    });
    this.userService.getAllMainUsers().subscribe(res => {
      this.mainusers = res;
      this._ref.detectChanges();
    });
    this.fundService.getAllFunds().subscribe(res => {
      this.funds = res;
      this.totalfundactual_amount = 0;
      this.totalfundpaid_amount = 0;
      this.totalfundremaining_amount = 0;
      this.BarCharttotalfundactual_amount = 0;
      this.BarCharttotalfundpaid_amount = 0;
      this.BarCharttotalfundremaining_amount = 0;
      for (let index = 0; index < this.funds.length; index++) {
        const element = this.funds[index];
        this.totalfundactual_amount = Number(this.totalfundactual_amount) + Number(element.actual_amount);
        this.totalfundpaid_amount = Number(this.totalfundpaid_amount) + Number(element.paid_amount);
        this.totalfundremaining_amount = Number(this.totalfundremaining_amount) + Number(element.remaining_amount);

        this.BarCharttotalfundactual_amount = Number(this.BarCharttotalfundactual_amount) + Number(element.actual_amount);
        this.BarCharttotalfundpaid_amount = Number(this.BarCharttotalfundpaid_amount) + Number(element.paid_amount);
        this.BarCharttotalfundremaining_amount = Number(this.BarCharttotalfundremaining_amount) + Number(element.remaining_amount);
      }
      this._ref.detectChanges();
    });
    this.expenceService.getAllExpences().subscribe(res => {
      this.expence = res;
      this.totalexpenceactual_amount = 0;
      this.totalexpencepaid_amount = 0;
      this.totalexpenceremaining_amount = 0;

      this.BarCharttotalexpenceactual_amount = 0;
      this.BarCharttotalexpencepaid_amount = 0;
      this.BarCharttotalexpenceremaining_amount = 0;
      for (let index = 0; index < this.expence.length; index++) {
        const element = this.expence[index];
        this.totalexpenceactual_amount = Number(this.totalexpenceactual_amount) + Number(element.actual_amount);
        this.totalexpencepaid_amount = Number(this.totalexpencepaid_amount) + Number(element.paid_amount);
        this.totalexpenceremaining_amount = Number(this.totalexpenceremaining_amount) + Number(element.remaining_amount);

        this.BarCharttotalexpenceactual_amount = Number(this.BarCharttotalexpenceactual_amount) + Number(element.actual_amount);
        this.BarCharttotalexpencepaid_amount = Number(this.BarCharttotalexpencepaid_amount) + Number(element.paid_amount);
        this.BarCharttotalexpenceremaining_amount = Number(this.BarCharttotalexpenceremaining_amount) + Number(element.remaining_amount);
      }
      this._ref.detectChanges();
    });

    this.dashboardService.GetDashboardCount().subscribe(res => {
      this.NetBalance = res[0]['net_balance'];
      this.TotalExpenses = res[0]['total_expense'];
      this.TotalIncome = res[0]['total_income'];

    });

    this.dashboardService.GetDashboardLineChartData().subscribe(res => {
      // console.log(res);
      const LineChart: Array<any> = [];
      const data: any = res;
      this.LineChartLable = [];
      data.forEach(element => {
        LineChart.push({ 'date': element.label, 'donation': element.fund, 'expense': element.expence});
      });

      const chart = am4core.create('financechart', am4charts.XYChart);
      chart.colors.step = 2;
      chart.data = LineChart;
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.minGridDistance = 50;
      function createAxisAndSeries(field, name, opposite, bullet) {
        let valueAxis;
        if (field === 'donation') {
          valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
          valueAxis.minimum = 0;
          valueAxis.min = 0;
        }

        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = field;
        series.dataFields.dateX = 'date';
        series.strokeWidth = 2;
        if (field === 'donation') {
          series.yAxis = valueAxis;
        }
        series.name = name;
        series.tooltipText = '{name}: [bold]{valueY}[/]';
        series.tensionX = 0.8;

        if (field === 'donation') {
          valueAxis.renderer.line.strokeOpacity = 1;
          valueAxis.renderer.line.strokeWidth = 2;
          valueAxis.renderer.line.stroke = series.stroke;
          valueAxis.renderer.labels.template.fill = series.stroke;
          valueAxis.renderer.opposite = opposite;
          valueAxis.renderer.grid.template.disabled = true;
        }
      }
      createAxisAndSeries('donation', 'Donation', false, 'circle');
      createAxisAndSeries('expense', 'Expense', false, 'circle');

      chart.legend = new am4charts.Legend();
      chart.cursor = new am4charts.XYCursor();
      this._ref.detectChanges();
    });

    /* this.dashboardService.GetDashboardUserDonation().subscribe(res => {
      const chart = am4core.create('chartdiv', am4charts.PieChart);
      const ChartData: Array<any> = [];
      ChartData.push({ 'sector': 'Less than ₹1,000', 'size': res[0]['less_1000']});
      ChartData.push({ 'sector': '₹1,000 To ₹5000', 'size': res[0]['1000_to_5000'] });
      ChartData.push({ 'sector': '₹5,000 To ₹50,000', 'size': res[0]['5000_to_50000'] });
      ChartData.push({ 'sector': 'Greater than ₹50,000', 'size': res[0]['greater_50000'] });
      chart.data = ChartData;
      chart.innerRadius = 100;

      const label = chart.seriesContainer.createChild(am4core.Label);
      label.text = res[0]['total_user'];
      label.horizontalCenter = 'middle';
      label.verticalCenter = 'middle';
      label.fontSize = 30;

      const pieSeries = chart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = 'size';
      pieSeries.dataFields.category = 'sector';
      pieSeries.innerRadius = am4core.percent(50);
      pieSeries.ticks.template.disabled = true;
      pieSeries.labels.template.disabled = true;

      chart.legend = new am4charts.Legend();
      chart.legend.position = 'right';
      this._ref.detectChanges();
    }); */
  }

  GetChartData(type) {
    this.LineChartSelectDateRang = false;
    this.userService.GetDashboardFinanceLineChartData(type).subscribe(res => {
      const LineChart: Array<any> = [];
      const data: any = res;
      this.LineChartLable = [];
      data.forEach(element => {
        LineChart.push({ 'date': element.label, 'donation': element.fund, 'expense': element.expence });
      });

      const chart = am4core.create('financechart', am4charts.XYChart);
      chart.colors.step = 2;
      chart.data = LineChart;
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.minGridDistance = 50;
      function createAxisAndSeries(field, name, opposite, bullet) {
        let valueAxis;
        if (field === 'donation') {
          valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
          valueAxis.minimum = 0;
          valueAxis.min = 0;
        }

        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = field;
        series.dataFields.dateX = 'date';
        series.strokeWidth = 2;
        if (field === 'donation') {
          series.yAxis = valueAxis;
        }
        series.name = name;
        series.tooltipText = '{name}: [bold]{valueY}[/]';
        series.tensionX = 0.8;

        if (field === 'donation') {
          valueAxis.renderer.line.strokeOpacity = 1;
          valueAxis.renderer.line.strokeWidth = 2;
          valueAxis.renderer.line.stroke = series.stroke;
          valueAxis.renderer.labels.template.fill = series.stroke;
          valueAxis.renderer.opposite = opposite;
          valueAxis.renderer.grid.template.disabled = true;
        }
      }
      createAxisAndSeries('donation', 'Donation', false, 'circle');
      createAxisAndSeries('expense', 'Expense', true, 'circle');

      chart.legend = new am4charts.Legend();
      chart.cursor = new am4charts.XYCursor();
      this._ref.detectChanges();
    });
  }

}
