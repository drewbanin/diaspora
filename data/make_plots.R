library(ggplot2)

source("multiplot.R")

results_csv <- "diaspora.csv"

df <- read.csv(results_csv, header=TRUE)

DISP_SUM <- df[df$metric == "DISP_SUM",]
p1 <- ggplot(DISP_SUM, aes(x=step, y=value)) + geom_point() + ggtitle("Step vs. Sum of Displacement");

DISP_AVG <- df[df$metric == "DISP_AVG",]
p2 <- ggplot(DISP_AVG, aes(x=step, y=value)) + geom_point() + ggtitle("Step vs. Avg Displacement");

POP_SIZE <- df[df$metric == "POP_SIZE",]
p3 <- ggplot(POP_SIZE, aes(x=step, y=value)) + geom_point() + ggtitle("Step vs. Population Size");

POPS_NUM <- df[df$metric == "POPS_NUM",]
p4 <- ggplot(POPS_NUM, aes(x=step, y=value)) + geom_point() + ggtitle("Step vs. Number of Cells");

MAX_DIST <- df[df$metric == "MAX_DIST",]
p5 <- ggplot(MAX_DIST, aes(x=step, y=value)) + geom_point() + ggtitle("Step vs. Max Displacement");

LAST_FPS <- df[df$metric == "LAST_FPS",]
p6 <- ggplot(LAST_FPS, aes(x=step, y=value)) + geom_point() + ggtitle("Step vs. FPS");

#MEM_USED <- df[df$metric == "MEM_USED"]

png("diaspora-sum.png"); p1; dev.off()
png("diaspora-avg.png"); p2; dev.off()
png("diaspora-sze.png"); p3; dev.off()
png("diaspora-num.png"); p4; dev.off()
png("diaspora-max.png"); p5; dev.off()
png("diaspora-fps.png"); p6; dev.off()

png("diaspora.png")
multiplot(p1, p2, p3, p4, p5, p6, cols=2)
dev.off()
