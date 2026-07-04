export type SalaryBreakdown = {
    basic: number;
    hra: number;
    standardAllowance: number;
    performanceBonus: number;
    leaveTravelAllowance: number;
    fixedAllowance: number;
    pfEmployee: number;
    pfEmployer: number;
    professionalTax: number;
    netMonthly: number;
  };
  
  export function computeSalary(
    monthlyWage: number,
    pfEmployeePct: number,
    pfEmployerPct: number,
    professionalTax: number
  ): SalaryBreakdown {
    const basic = round2(monthlyWage * 0.5);
    const hra = round2(basic * 0.5);
    const standardAllowance = round2(monthlyWage * (1 / 12));
    const performanceBonus = round2(monthlyWage * 0.0833);
    const leaveTravelAllowance = round2(monthlyWage * 0.0833);
    const sumSoFar = basic + hra + standardAllowance + performanceBonus + leaveTravelAllowance;
    const fixedAllowance = round2(Math.max(monthlyWage - sumSoFar, 0));
  
    const pfEmployee = round2((basic * pfEmployeePct) / 100);
    const pfEmployer = round2((basic * pfEmployerPct) / 100);
    const netMonthly = round2(monthlyWage - pfEmployee - professionalTax);
  
    return {
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      leaveTravelAllowance,
      fixedAllowance,
      pfEmployee,
      pfEmployer,
      professionalTax,
      netMonthly,
    };
  }
  
  function round2(n: number) {
    return Math.round(n * 100) / 100;
  }