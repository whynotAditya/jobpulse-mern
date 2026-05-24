import { useEffect, useState } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Building2, PieChart, Info } from "lucide-react";
import "./SalaryAnalytics.css";

function formatCurrency(num) {
    if (!num) return "$0";
    if (num >= 1000) {
        return `$${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    }
    return `$${num.toLocaleString()}`;
}

export default function SalaryAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/jobs/salary-analytics")
            .then((res) => setData(res.data.data))
            .catch(() => toast.error("Failed to load salary data"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <span className="spinner-lg" />
            </div>
        );
    }

    if (!data || data.totalWithSalary === 0) {
        return (
            <div className="salary-page animate-fade">
                <div className="salary-header">
                    <div>
                        <h1>
                            <DollarSign size={26} style={{ verticalAlign: "middle", marginRight: 8 }} />
                            Salary Analytics
                        </h1>
                        <p>Compensation insights across your applications</p>
                    </div>
                </div>
                <div className="salary-empty">
                    <span className="salary-empty-icon">💰</span>
                    <h3>No salary data yet</h3>
                    <p>Add salary information to your job applications to see analytics. Go to Jobs → Edit a job → Add salary.</p>
                </div>
            </div>
        );
    }

    const maxDist = Math.max(...data.distribution.map((d) => d.count), 1);

    return (
        <div className="salary-page animate-fade">
            <div className="salary-header">
                <div>
                    <h1>
                        <DollarSign size={26} style={{ verticalAlign: "middle", marginRight: 8 }} />
                        Salary Analytics
                    </h1>
                    <p>Compensation insights across your applications</p>
                </div>
            </div>

            {/* ─── Data Coverage ──────────────────── */}
            <div className="sal-coverage">
                <div className="sal-coverage-icon"><Info size={18} /></div>
                <span className="sal-coverage-text">
                    Analyzing <strong>{data.totalWithSalary}</strong> jobs with salary data
                    {data.totalWithout > 0 && <> ({data.totalWithout} jobs without salary info)</>}
                </span>
            </div>

            {/* ─── Overview Cards ─────────────────── */}
            <div className="salary-overview">
                <div className="sal-card sal-avg" style={{ animationDelay: "0ms" }}>
                    <span className="sal-card-label">Average Salary</span>
                    <span className="sal-card-value">{formatCurrency(data.average)}</span>
                    <span className="sal-card-sub">Across all applications</span>
                </div>
                <div className="sal-card sal-med" style={{ animationDelay: "60ms" }}>
                    <span className="sal-card-label">Median Salary</span>
                    <span className="sal-card-value">{formatCurrency(data.median)}</span>
                    <span className="sal-card-sub">Middle value</span>
                </div>
                <div className="sal-card sal-min" style={{ animationDelay: "120ms" }}>
                    <span className="sal-card-label">Minimum</span>
                    <span className="sal-card-value">{formatCurrency(data.min)}</span>
                    <span className="sal-card-sub">Lowest offer</span>
                </div>
                <div className="sal-card sal-max" style={{ animationDelay: "180ms" }}>
                    <span className="sal-card-label">Maximum</span>
                    <span className="sal-card-value">{formatCurrency(data.max)}</span>
                    <span className="sal-card-sub">Highest offer</span>
                </div>
            </div>

            {/* ─── Charts ─────────────────────────── */}
            <div className="salary-charts">
                {/* Distribution */}
                <div className="sal-chart-card" style={{ animationDelay: "100ms" }}>
                    <div className="sal-chart-title">
                        <BarChart3 size={18} />
                        Salary Distribution
                    </div>
                    <p className="sal-chart-sub">How your applications spread across salary ranges</p>
                    <div className="dist-chart">
                        {data.distribution.map((d, i) => {
                            const pct = maxDist > 0 ? (d.count / maxDist) * 100 : 0;
                            return (
                                <div key={i} className="dist-row">
                                    <span className="dist-label">{d.label}</span>
                                    <div className="dist-bar-track">
                                        <div className="dist-bar-fill" style={{ width: `${Math.max(pct, 2)}%` }}>
                                            {d.count > 0 && pct > 15 && (
                                                <span className="dist-bar-count">{d.count}</span>
                                            )}
                                        </div>
                                    </div>
                                    {(d.count === 0 || pct <= 15) && (
                                        <span className="dist-bar-count outside">{d.count}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* By Status */}
                <div className="sal-chart-card" style={{ animationDelay: "160ms" }}>
                    <div className="sal-chart-title">
                        <PieChart size={18} />
                        By Application Status
                    </div>
                    <p className="sal-chart-sub">Average salary per status category</p>
                    {data.byStatus.length > 0 ? (
                        <table className="sal-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Count</th>
                                    <th>Avg</th>
                                    <th>Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.byStatus.map((s) => (
                                    <tr key={s.status}>
                                        <td>
                                            <span className={`sal-status-dot dot-${s.status.toLowerCase()}`} />
                                            {s.status}
                                        </td>
                                        <td>{s.count}</td>
                                        <td className="sal-money highlight">{formatCurrency(s.average)}</td>
                                        <td className="sal-money">
                                            {formatCurrency(s.min)} – {formatCurrency(s.max)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No data available</p>
                    )}
                </div>
            </div>

            {/* ─── Company Ranking ────────────────── */}
            {data.byCompany.length > 0 && (
                <div className="sal-chart-card" style={{ animationDelay: "220ms" }}>
                    <div className="sal-chart-title">
                        <Building2 size={18} />
                        Top Paying Companies
                    </div>
                    <p className="sal-chart-sub">Ranked by average salary</p>
                    <div className="company-ranking">
                        {data.byCompany.map((c, i) => (
                            <div key={i} className="company-rank-item">
                                <div className="company-rank-num">{i + 1}</div>
                                <div className="company-rank-info">
                                    <span className="company-rank-name">{c.company}</span>
                                    <span className="company-rank-count">{c.count} job{c.count !== 1 ? "s" : ""}</span>
                                </div>
                                <span className="company-rank-salary">{formatCurrency(c.average)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
